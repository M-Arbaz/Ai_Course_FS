
import "dotenv/config";
import db from "../DB/db.js";
import { getStripe } from "../Services/stripeClient.js";


export const createCourseCheckout = async (req, res) => {
    let checkoutLockConnection = null;
    let checkoutLockAcquired = false;
    let checkoutLockName = null;

    try {

        // Sandbox only
        if (
            process.env.STRIPE_CHECKOUT_TEST_ENABLED !== "true" ||
            !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
        ) {
            return res.status(503).json({
                success: false,
                message: "Test checkout is not enabled.",
            });
        }

        const frontendUrl = process.env.STRIPE_FRONTEND_URL;

        if (!frontendUrl) {
            return res.status(503).json({
                success: false,
                message: "Checkout URL not configured.",
            });
        }

        const frontend = new URL(frontendUrl);

        // Require HTTPS except local development
        if (
            frontend.protocol !== "https:" &&
            frontend.hostname !== "localhost"
        ) {
            return res.status(503).json({
                success: false,
                message: "Invalid checkout configuration.",
            });
        }

        // Protect cookie-authenticated checkout requests
        if (req.get("origin") !== frontend.origin) {
            return res.status(403).json({
                success: false,
                message: "Invalid request origin.",
            });
        }

        const userId = req.auth.userId;
        const { slug } = req.params;

        // Load authenticated user
        const [users] = await db.execute(
            `SELECT id, email
             FROM users
             WHERE id = ? AND status = 'active'
             LIMIT 1`,
            [userId]
        );

        if (!users.length || !users[0].email) {
            return res.status(401).json({
                success: false,
                message: "User account unavailable.",
            });
        }

        // Load actual course and its Stripe Price
        const [courses] = await db.execute(
            `SELECT c.id, c.slug, p.stripe_price_id
             FROM courses c
             JOIN course_stripe_prices p
               ON p.course_id = c.id
             WHERE c.slug = ?
               AND c.is_active = 1
               AND p.is_active = 1
               AND p.stripe_mode = 'test'
             LIMIT 1`,
            [slug]
        );

        if (!courses.length) {
            return res.status(404).json({
                success: false,
                message: "Course subscription price not configured.",
            });
        }


        const course = courses[0];

        // Serialize checkout creation per user and course.
        checkoutLockConnection = await db.getConnection();

        checkoutLockName =
            `ai-course-checkout-${userId}-${course.id}`;

        const [lockRows] =
            await checkoutLockConnection.execute(
                "SELECT GET_LOCK(?, 10) AS acquired",
                [checkoutLockName]
            );

        if (Number(lockRows[0]?.acquired) !== 1) {
            return res.status(409).json({
                success: false,
                message:
                    "Another checkout is being prepared. Please retry.",
            });
        }

        checkoutLockAcquired = true;

        // Legacy enrollments remain valid permanently.
        // Stripe enrollments require valid paid access.
        const [enrollments] = await db.execute(
            `SELECT
                ce.id,
                ce.status,
                ce.access_source,
                EXISTS (
                    SELECT 1
                    FROM course_subscriptions cs
                    WHERE cs.user_id = ce.user_id
                      AND cs.course_id = ce.course_id
                      AND cs.status = 'active'
                      AND cs.ended_at IS NULL
                  
                       AND cs.current_period_end >
                           UTC_TIMESTAMP()
                       AND cs.paid_through >
                           UTC_TIMESTAMP()

                ) AS has_paid_access
             FROM course_enrollments ce
             WHERE ce.user_id = ?
               AND ce.course_id = ?
             LIMIT 1`,
            [userId, course.id]
        );


        // Do not charge users when an inactive
        // legacy enrollment requires reconciliation.
        const hasInactiveLegacyEnrollment =
            enrollments.some(
                (enrollment) =>
                    enrollment.access_source === "legacy" &&
                    !["active", "completed"].includes(
                        enrollment.status
                    )
            );

        if (hasInactiveLegacyEnrollment) {
            return res.status(409).json({
                success: false,
                code: "LEGACY_ENROLLMENT_REVIEW_REQUIRED",
                message:
                    "Your previous course enrollment needs review before subscribing. Please contact support.",
            });
        }

        const alreadyHasAccess = enrollments.some(
            (enrollment) =>
                ["active", "completed"].includes(
                    enrollment.status
                ) &&
                (
                    enrollment.access_source === "legacy" ||
                    (
                        enrollment.access_source === "stripe" &&
                        Number(
                            enrollment.has_paid_access
                        ) === 1
                    )
                )
        );

        if (alreadyHasAccess) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have access to this course.",
            });
        }

        // Historical records are never deleted.
        // Any previous subscription attempt makes
        // the intro discount ineligible.
        const [historyRows] = await db.execute(
            `SELECT COUNT(*) AS subscription_count
             FROM course_subscriptions
             WHERE user_id = ?
               AND course_id = ?`,
            [userId, course.id]
        );

        const hasDatabaseHistory =
            Number(historyRows[0].subscription_count) > 0 ||
            enrollments.some(
                (row) => row.access_source === "stripe"
            );

        const stripe = getStripe();


        // Verify configured monthly recurring price
        const price = await stripe.prices.retrieve(
            course.stripe_price_id
        );

        if (
            !price.active ||
            price.type !== "recurring" ||
            price.recurring?.interval !== "month" ||
            price.currency !== "usd"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid monthly subscription price.",
            });
        }


        // Find the existing Stripe Customer.
        const [customers] = await db.execute(
            `SELECT stripe_customer_id
             FROM stripe_customers
             WHERE user_id = ?
               AND stripe_mode = 'test'
             LIMIT 1`,
            [userId]
        );

        let stripeCustomerId =
            customers[0]?.stripe_customer_id || null;

        // Fail closed if old billing records exist
        // but the Stripe customer mapping is missing.
        if (hasDatabaseHistory && !stripeCustomerId) {
            return res.status(409).json({
                success: false,
                message:
                    "Previous billing history requires account synchronization.",
            });
        }

        // Persist the customer before Checkout.
        // This lets us detect open Checkout Sessions.
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create(
                {
                    email: users[0].email,
                    metadata: {
                        lms_user_id: String(userId),
                    },
                },
                {
                    idempotencyKey:
                        `ai-course-test-customer-${userId}`,
                }
            );

            await db.execute(
                `INSERT INTO stripe_customers (
                    user_id,
                    stripe_customer_id,
                    stripe_mode
                )
                VALUES (?, ?, 'test')
                ON DUPLICATE KEY UPDATE
                    stripe_customer_id =
                        stripe_customer_id`,
                [userId, customer.id]
            );

            const [savedCustomers] = await db.execute(
                `SELECT stripe_customer_id
                 FROM stripe_customers
                 WHERE user_id = ?
                   AND stripe_mode = 'test'
                 LIMIT 1`,
                [userId]
            );

            stripeCustomerId =
                savedCustomers[0]?.stripe_customer_id;

            if (!stripeCustomerId) {
                throw new Error(
                    "Unable to establish Stripe customer mapping."
                );
            }
        }

        // Verify actual Stripe subscription history,
        // including canceled subscriptions.
        let hasStripeHistory = false;
        let hasOngoingSubscription = false;

        for await (
            const sub of stripe.subscriptions.list({
                customer: stripeCustomerId,
                status: "all",
                limit: 100,
            })
        ) {
            if (
                String(sub.metadata?.user_id) !==
                String(userId) ||
                String(sub.metadata?.course_id) !==
                String(course.id)
            ) {
                continue;
            }

            hasStripeHistory = true;

            if (
                ![
                    "canceled",
                    "incomplete_expired",
                ].includes(sub.status)
            ) {
                hasOngoingSubscription = true;
                break;
            }
        }

        if (hasOngoingSubscription) {
            return res.status(409).json({
                success: false,
                message:
                    "A subscription already exists for this course. Manage the existing subscription before purchasing again.",
            });
        }

        const introDiscountEligible =
            !hasDatabaseHistory &&
            !hasStripeHistory;

        // Reuse an existing open Checkout Session.
        // Avoid creating multiple payable sessions.
        for await (
            const openSession of
            stripe.checkout.sessions.list({
                customer: stripeCustomerId,
                status: "open",
                limit: 100,
            })
        ) {
            if (
                openSession.mode === "subscription" &&
                openSession.metadata?.user_id ===
                String(userId) &&
                openSession.metadata?.course_id ===
                String(course.id) &&
                openSession.metadata?.price_id ===
                course.stripe_price_id &&
                openSession.url
            ) {
                return res.status(200).json({
                    success: true,
                    checkoutUrl: openSession.url,
                });
            }
        }

        // Only first-time subscribers receive coupon.
        let couponId = null;

        if (introDiscountEligible) {
            couponId =
                process.env.STRIPE_FIRST_MONTH_COUPON_ID;

            if (!couponId) {
                return res.status(503).json({
                    success: false,
                    message:
                        "Introductory discount is not configured.",
                });
            }

            const coupon =
                await stripe.coupons.retrieve(couponId);

            if (
                !coupon.valid ||
                coupon.percent_off !== 50 ||
                coupon.duration !== "once"
            ) {
                return res.status(503).json({
                    success: false,
                    message:
                        "Introductory discount configuration is invalid.",
                });
            }
        }



        const metadata = {
            user_id: String(userId),
            course_id: String(course.id),
            course_slug: course.slug,
            price_id: course.stripe_price_id,
        };


        const returnPath =
            `/courses/${encodeURIComponent(course.slug)}/enroll`;

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],


            customer: stripeCustomerId,

            client_reference_id: String(userId),

            line_items: [
                {
                    price: course.stripe_price_id,
                    quantity: 1,
                },
            ],


            ...(introDiscountEligible
                ? {
                    discounts: [
                        {
                            coupon: couponId,
                        },
                    ],
                }
                : {}),


            metadata,

            subscription_data: {
                metadata,
            },

            success_url:
                `${frontend.origin}${returnPath}` +
                "?checkout=success&session_id={CHECKOUT_SESSION_ID}",

            cancel_url:
                `${frontend.origin}${returnPath}?checkout=cancelled`,
        });

        return res.status(200).json({
            success: true,
            checkoutUrl: session.url,
        });



    } catch (error) {
        console.error("Stripe checkout error:", error);

        const showDebug =
            process.env.STRIPE_CHECKOUT_TEST_ENABLED === "true" &&
            process.env.STRIPE_CHECKOUT_DEBUG === "true";

        return res.status(500).json({
            success: false,
            message: "Unable to create checkout session.",
            ...(showDebug
                ? {
                    debug: {
                        type: error?.type || error?.name || null,
                        code: error?.code || null,
                        param: error?.param || null,
                        detail: String(
                            error?.message || "Unknown error"
                        ).slice(0, 300),
                    },
                }
                : {}),
        });
    } finally {

        if (checkoutLockConnection) {
            if (checkoutLockAcquired) {
                await checkoutLockConnection
                    .execute(
                        "SELECT RELEASE_LOCK(?)",
                        [checkoutLockName]
                    )
                    .catch((error) => {
                        console.error(
                            "Checkout lock release error:",
                            error
                        );
                    });
            }

            checkoutLockConnection.release();
        }
    }
};

