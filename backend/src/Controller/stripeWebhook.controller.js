
import db from "../DB/db.js";
import { getStripe } from "../Services/stripeClient.js";

const EVENTS = new Set([
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
]);

const getId = (value) =>
    typeof value === "string" ? value : value?.id;

const toMysqlDate = (timestamp) => {
    if (!Number.isFinite(timestamp)) return null;

    return new Date(timestamp * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
};

export const stripeWebhookHandler = async (req, res) => {
    if (
        !process.env.STRIPE_WEBHOOK_SECRET ||
        !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    ) {
        return res.status(503).json({
            error: "Stripe sandbox webhook not configured",
        });
    }

    const stripe = getStripe();
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Stripe signature error:", error.message);

        return res.status(400).json({
            error: "Invalid webhook signature",
        });
    }

    if (event.livemode) {
        return res.status(400).json({
            error: "Live events not accepted",
        });
    }

    if (!EVENTS.has(event.type)) {
        return res.json({ received: true });
    }

    let connection;

    try {
        const object = event.data.object;
        let subscriptionId = null;

        if (event.type === "checkout.session.completed") {
            if (object.mode !== "subscription") {
                return res.json({ received: true });
            }

            subscriptionId = getId(object.subscription);
        } else if (
            event.type.startsWith("customer.subscription.")
        ) {
            subscriptionId = object.id;
        } else {
            subscriptionId = getId(
                object.subscription ||
                object.parent?.subscription_details?.subscription
            );
        }

        if (!subscriptionId) {
            console.warn(
                "Stripe event without subscription:",
                event.id
            );
            return res.json({ received: true });
        }

        // Fetch current subscription to reduce
        // problems caused by out-of-order events.


        const subscription =
            await stripe.subscriptions.retrieve(
                subscriptionId
            );


        const userId = String(
            subscription.metadata?.user_id || ""
        );

        const courseId = String(
            subscription.metadata?.course_id || ""
        );

        const customerId = getId(subscription.customer);
        const priceId = getId(
            subscription.items?.data?.[0]?.price
        );

        if (
            !/^\d+$/.test(userId) ||
            !/^\d+$/.test(courseId) ||
            !customerId ||
            !priceId
        ) {
            console.warn(
                "Unmapped Stripe subscription:",
                subscriptionId
            );
            return res.json({ received: true });
        }

        // Only accept prices mapped to this LMS course.
        const [prices] = await db.execute(
            `SELECT id
             FROM course_stripe_prices
             WHERE course_id = ?
               AND stripe_price_id = ?
               AND stripe_mode = 'test'
             LIMIT 1`,
            [courseId, priceId]
        );

        if (!prices.length) {
            throw new Error(
                "Subscription price is not mapped to this course"
            );
        }


        const periodEnd =
            subscription.items?.data?.[0]?.current_period_end ??
            subscription.current_period_end;

        let verifiedPaidThrough = null;

        // Only a genuine invoice.paid event can
        // extend the verified paid entitlement.
        if (event.type === "invoice.paid") {
            const invoice =
                await stripe.invoices.retrieve(object.id);

            const item =
                subscription.items?.data?.[0];

            const invoiceSubscriptionId = getId(
                invoice.subscription ||
                invoice.parent?.subscription_details?.subscription
            );

            const validPaidInvoice =
                invoice.livemode === false &&
                invoice.status === "paid" &&
                invoice.paid === true &&
                invoice.paid_out_of_band !== true &&
                invoice.collection_method ===
                "charge_automatically" &&
                invoice.currency === "usd" &&
                Number.isInteger(invoice.amount_paid) &&
                invoice.amount_paid > 0 &&
                ["subscription_create", "subscription_cycle"]
                    .includes(invoice.billing_reason) &&
                getId(invoice.customer) === customerId &&
                invoiceSubscriptionId === subscription.id &&
                subscription.status === "active" &&
                subscription.items?.data?.length === 1 &&
                getId(item?.price) === priceId &&
                item?.price?.currency === "usd" &&
                item?.price?.recurring?.interval === "month" &&
                item?.price?.recurring?.interval_count === 1 &&
                Number.isFinite(periodEnd);

            if (validPaidInvoice) {
                // Invoice general period_end is not
                // necessarily the subscribed service period.
                for await (
                    const line of stripe.invoices.listLineItems(
                        invoice.id,
                        { limit: 100 }
                    )
                ) {
                    const linePriceId =
                        line.pricing?.price_details?.price ||
                        getId(line.price);

                    const lineSubscriptionItemId =
                        line.parent
                            ?.subscription_item_details
                            ?.subscription_item ||
                        getId(line.subscription_item);

                    const matchingLine =
                        linePriceId === priceId &&
                        lineSubscriptionItemId === item.id &&
                        line.parent
                            ?.subscription_item_details
                            ?.proration !== true &&
                        line.currency === "usd" &&
                        Number(line.amount) > 0 &&
                        Number.isInteger(line.period?.start) &&
                        Number.isInteger(line.period?.end) &&
                        line.period.end >
                        Math.floor(Date.now() / 1000) &&
                        line.period.end > line.period.start &&
                        line.period.end <= periodEnd;

                    if (matchingLine) {
                        verifiedPaidThrough =
                            toMysqlDate(line.period.end);
                        break;
                    }
                }
            }
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Event ID is unique. The transaction prevents
        // incomplete processing from being marked complete.
        const [inserted] = await connection.execute(
            `INSERT IGNORE INTO stripe_webhook_events
                (stripe_event_id, event_type)
             VALUES (?, ?)`,
            [event.id, event.type]
        );

        if (inserted.affectedRows === 0) {
            await connection.rollback();

            return res.json({
                received: true,
                duplicate: true,
            });
        }

        // Map Stripe Customer to authenticated LMS user.
        const [existingCustomers] = await connection.execute(
            `SELECT stripe_customer_id
             FROM stripe_customers
             WHERE user_id = ?
               AND stripe_mode = 'test'
             LIMIT 1 FOR UPDATE`,
            [userId]
        );

        if (
            existingCustomers.length &&
            existingCustomers[0].stripe_customer_id !== customerId
        ) {
            throw new Error(
                "User is mapped to a different Stripe customer"
            );
        }

        if (!existingCustomers.length) {
            await connection.execute(
                `INSERT INTO stripe_customers
                    (user_id, stripe_customer_id, stripe_mode)
                 VALUES (?, ?, 'test')`,
                [userId, customerId]
            );
        }

        const checkoutSessionId =
            event.type === "checkout.session.completed"
                ? object.id
                : null;

        await connection.execute(
            `INSERT INTO course_subscriptions (
                user_id,
                course_id,
                stripe_customer_id,
                stripe_subscription_id,
                stripe_checkout_session_id,
                stripe_price_id,
                status,
                current_period_end,
                cancel_at_period_end,
                ended_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                current_period_end = VALUES(current_period_end),
                cancel_at_period_end =
                    VALUES(cancel_at_period_end),
                ended_at = VALUES(ended_at),
                stripe_checkout_session_id = COALESCE(
                    VALUES(stripe_checkout_session_id),
                    stripe_checkout_session_id
                )`,
            [
                userId,
                courseId,
                customerId,
                subscription.id,
                checkoutSessionId,
                priceId,
                subscription.status,
                toMysqlDate(periodEnd),
                subscription.cancel_at_period_end ? 1 : 0,
                toMysqlDate(subscription.ended_at),
            ]
        );


        // Activate LMS access only after verifying
        // the latest paid Stripe subscription invoice.
        const invoice = subscription.latest_invoice;

        const invoiceSubscriptionId = getId(
            invoice?.subscription ||
            invoice?.parent?.subscription_details?.subscription
        );

        const hasVerifiedPaidAccess =
            invoice &&
            typeof invoice === "object" &&
            invoice.status === "paid" &&
            invoice.paid === true &&
            invoice.paid_out_of_band !== true &&
            invoice.collection_method ===
            "charge_automatically" &&
            invoice.currency === "usd" &&
            Number.isInteger(invoice.amount_paid) &&
            invoice.amount_paid > 0 &&
            getId(invoice.customer) === customerId &&
            invoiceSubscriptionId === subscription.id &&
            subscription.status === "active" &&
            subscription.items?.data?.length === 1 &&
            Number.isFinite(periodEnd) &&
            periodEnd > Math.floor(Date.now() / 1000);

        if (hasVerifiedPaidAccess) {
            await connection.execute(
                `INSERT INTO course_enrollments (
                    user_id,
                    course_id,
                    status,
                    access_source,
                    enrolled_at
                )
                VALUES (
                    ?, ?,
                    'active',
                    'stripe',
                    UTC_TIMESTAMP()
                )

                ON DUPLICATE KEY UPDATE
                    status = CASE
                        WHEN access_source = 'stripe'
                             AND status <> 'completed'
                        THEN 'active'
                        ELSE status
                    END`,
                [userId, courseId]

            );
        }

        // Verified payment entitlement and LMS enrollment
        // must be updated in the same database transaction.
        if (verifiedPaidThrough) {
            const [matchedSubscriptions] =
                await connection.execute(
                    `SELECT id
                     FROM course_subscriptions
                     WHERE stripe_subscription_id = ?
                       AND stripe_customer_id = ?
                       AND stripe_price_id = ?
                       AND user_id = ?
                       AND course_id = ?
                     LIMIT 1 FOR UPDATE`,
                    [
                        subscription.id,
                        customerId,
                        priceId,
                        userId,
                        courseId,
                    ]
                );

            if (!matchedSubscriptions.length) {
                throw new Error(
                    "Verified subscription mapping was not found."
                );
            }

            // Never move the paid-through date backwards.
            await connection.execute(
                `UPDATE course_subscriptions
                 SET paid_through = CASE
                     WHEN paid_through IS NULL
                          OR paid_through < ?
                     THEN ?
                     ELSE paid_through
                 END
                 WHERE id = ?`,
                [
                    verifiedPaidThrough,
                    verifiedPaidThrough,
                    matchedSubscriptions[0].id,
                ]
            );

            // Preserve legacy and completed enrollments.
            // Restore inactive Stripe enrollments only
            // after the verified payment.
            await connection.execute(
                `INSERT INTO course_enrollments (
                    user_id,
                    course_id,
                    status,
                    access_source,
                    enrolled_at
                )
                VALUES (
                    ?, ?,
                    'active',
                    'stripe',
                    UTC_TIMESTAMP()
                )
                ON DUPLICATE KEY UPDATE
                    status = CASE
                        WHEN access_source = 'stripe'
                             AND status <> 'completed'
                        THEN 'active'
                        ELSE status
                    END`,
                [userId, courseId]
            );
        }

        await connection.commit();

        return res.json({ received: true });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => { });
        }

        console.error("Stripe webhook error:", error);

        return res.status(500).json({
            error: "Webhook processing failed",
        });
    } finally {
        connection?.release();
    }
};
