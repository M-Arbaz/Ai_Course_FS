
import "dotenv/config";
import db from "../DB/db.js";
import { getStripe } from "../Services/stripeClient.js";

export const createCourseCheckout = async (req, res) => {
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

        // Prevent charging already enrolled students
        const [enrollments] = await db.execute(
            `SELECT id
             FROM course_enrollments
             WHERE user_id = ?
               AND course_id = ?
               AND status IN ('active', 'completed')
             LIMIT 1`,
            [userId, course.id]
        );

        if (enrollments.length) {
            return res.status(409).json({
                success: false,
                message: "You already have access to this course.",
            });
        }

        // Prevent another ongoing subscription
        const [subscriptions] = await db.execute(
            `SELECT id
             FROM course_subscriptions
             WHERE user_id = ?
               AND course_id = ?
               AND status IN (
                   'active', 'trialing', 'past_due', 'unpaid'
               )
             LIMIT 1`,
            [userId, course.id]
        );

        if (subscriptions.length) {
            return res.status(409).json({
                success: false,
                message: "A subscription already exists for this course.",
            });
        }

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

        // Verify first-payment discount
        const couponId =
            process.env.STRIPE_FIRST_MONTH_COUPON_ID;

        if (!couponId) {
            return res.status(503).json({
                success: false,
                message: "Subscription discount not configured.",
            });
        }

        const coupon = await stripe.coupons.retrieve(couponId);

        if (
            !coupon.valid ||
            coupon.percent_off !== 50 ||
            coupon.duration !== "once"
        ) {
            return res.status(503).json({
                success: false,
                message: "First-month discount configuration is invalid.",
            });
        }

        // Reuse an existing Stripe Customer if available
        const [customers] = await db.execute(
            `SELECT stripe_customer_id
             FROM stripe_customers
             WHERE user_id = ?
               AND stripe_mode = 'test'
             LIMIT 1`,
            [userId]
        );

        const customerData = customers.length
            ? { customer: customers[0].stripe_customer_id }
            : { customer_email: users[0].email };

        const metadata = {
            user_id: String(userId),
            course_id: String(course.id),
            course_slug: course.slug,
        };

        const returnPath =
            `/courses/${encodeURIComponent(course.slug)}/enroll`;

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],

            ...customerData,

            client_reference_id: String(userId),

            line_items: [
                {
                    price: course.stripe_price_id,
                    quantity: 1,
                },
            ],

            discounts: [
                {
                    coupon: couponId,
                },
            ],

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

        return res.status(500).json({
            success: false,
            message: "Unable to create checkout session.",
        });
    }
};
