
import db from "../DB/db.js";
import { getStripe } from "../Services/stripeClient.js";
import { createHash } from "node:crypto";

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

const toMysqlDate = (unixSeconds) => {
    if (!Number.isInteger(unixSeconds) || unixSeconds <= 0) return null;
    return new Date(unixSeconds * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
};

// Modern Stripe Invoice objects no longer have paid or paid_out_of_band.
// Verify genuine Stripe InvoicePayments and successful PaymentIntents.
const verifyInvoiceCardPayments = async (stripe, invoice, customerId) => {
    const paidEntries = await stripe.invoicePayments.list({
        invoice: invoice.id,
        status: "paid",
        limit: 100,
    });

    let totalVerified = 0;

    for (const entry of paidEntries.data) {
        const intentId = getId(entry.payment?.payment_intent);

        if (
            entry.status !== "paid" ||
            entry.livemode !== false ||
            entry.currency !== "usd" ||
            getId(entry.invoice) !== invoice.id ||
            entry.payment?.type !== "payment_intent" ||
            !intentId?.startsWith("pi_") ||
            !Number.isInteger(entry.amount_paid) ||
            entry.amount_paid <= 0
        ) {
            continue;
        }

        const intent = await stripe.paymentIntents.retrieve(intentId);

        if (
            intent.livemode !== false ||
            intent.status !== "succeeded" ||
            intent.currency !== "usd" ||
            getId(intent.customer) !== customerId ||
            !Number.isInteger(intent.amount_received) ||
            intent.amount_received < entry.amount_paid
        ) {
            continue;
        }

        totalVerified += entry.amount_paid;
    }

    return (
        Number.isInteger(invoice.amount_paid) &&
        invoice.amount_paid > 0 &&
        totalVerified >= invoice.amount_paid
    );
};

export const stripeWebhookHandler = async (req, res) => {
    if (
        !process.env.STRIPE_WEBHOOK_SECRET ||
        !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    ) {
        return res.status(503).json({
            error: "Sandbox webhook not configured",
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
        console.error(
            "Stripe signature verification failed:",
            error.message
        );
        return res.status(400).json({
            error: "Invalid signature",
        });
    }

    if (event.livemode) {
        return res.status(400).json({
            error: "Live events not accepted",
        });
    }

    if (!EVENTS.has(event.type)) {
        return res.json({
            received: true,
            ignored: true,
        });
    }

    let connection = null;
    let lockName = null;
    let lockAcquired = false;
    let inTransaction = false;

    try {
        const object = event.data.object;
        let subscriptionId;

        if (event.type === "checkout.session.completed") {
            if (object.mode !== "subscription") {
                return res.json({
                    received: true,
                    ignored: true,
                });
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

            if (
                !subscriptionId &&
                object.id?.startsWith("in_")
            ) {
                const invoice =
                    await stripe.invoices.retrieve(object.id);

                subscriptionId = getId(
                    invoice.subscription ||
                    invoice.parent?.subscription_details?.subscription
                );
            }
        }

        if (!subscriptionId) {
            console.warn(
                "Stripe event missing subscription:",
                event.id,
                event.type
            );
            return res.json({
                received: true,
                ignored: true,
            });
        }

        connection = await db.getConnection();

        lockName = `stripe-wh-${createHash("sha256")
            .update(subscriptionId)
            .digest("hex")
            .slice(0, 48)}`;

        const [locks] = await connection.execute(
            "SELECT GET_LOCK(?, 10) AS acquired",
            [lockName]
        );

        if (Number(locks[0]?.acquired) !== 1) {
            throw new Error("Stripe subscription lock timeout");
        }

        lockAcquired = true;

        const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

        const item = subscription.items?.data?.[0];

        const userId =
            String(subscription.metadata?.user_id || "");

        const courseId =
            String(subscription.metadata?.course_id || "");

        const customerId = getId(subscription.customer);
        const priceId = getId(item?.price);

        if (
            !/^\d+$/.test(userId) ||
            !/^\d+$/.test(courseId) ||
            !customerId?.startsWith("cus_") ||
            !priceId?.startsWith("price_") ||
            subscription.livemode !== false ||
            subscription.items?.data?.length !== 1
        ) {
            console.warn(
                "Unmapped LMS subscription:",
                subscriptionId
            );
            return res.json({
                received: true,
                ignored: true,
            });
        }

        const [prices] = await connection.execute(
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
                "Stripe price not mapped to LMS course"
            );
        }

        const currentPeriodEnd =
            item.current_period_end ??
            subscription.current_period_end;

        let verifiedPaidThrough = null;
        let verifiedPaidPeriodEnd = null;

        if (event.type === "invoice.paid") {
            const invoice =
                await stripe.invoices.retrieve(object.id);

            const invoiceSubscriptionId = getId(
                invoice.subscription ||
                invoice.parent?.subscription_details?.subscription
            );

            const invoiceFieldsValid =
                invoice.livemode === false &&
                invoice.status === "paid" &&
                invoice.collection_method ===
                "charge_automatically" &&
                invoice.currency === "usd" &&
                Number.isInteger(invoice.amount_paid) &&
                invoice.amount_paid > 0 &&
                [
                    "subscription_create",
                    "subscription_cycle",
                ].includes(invoice.billing_reason) &&
                getId(invoice.customer) === customerId &&
                invoiceSubscriptionId === subscription.id &&
                getId(item.price) === priceId &&
                item.price?.currency === "usd" &&
                item.price?.recurring?.interval === "month" &&
                item.price?.recurring?.interval_count === 1;

            if (!invoiceFieldsValid) {
                console.warn(
                    "Invoice entitlement fields did not match:",
                    {
                        invoiceId: invoice.id,
                        subscriptionId,
                        status: invoice.status,
                        billingReason: invoice.billing_reason,
                    }
                );
            } else {
                const actualStripePayment =
                    await verifyInvoiceCardPayments(
                        stripe,
                        invoice,
                        customerId
                    );

                if (!actualStripePayment) {
                    console.warn(
                        "Invoice has no verified Stripe payment:",
                        invoice.id
                    );
                } else {
                    for await (
                        const line of stripe.invoices.listLineItems(
                            invoice.id,
                            { limit: 100 }
                        )
                    ) {
                        const linePriceId =
                            getId(
                                line.pricing?.price_details?.price
                            ) ||
                            getId(line.price);

                        const lineItemId =
                            getId(
                                line.parent
                                    ?.subscription_item_details
                                    ?.subscription_item
                            ) ||
                            getId(line.subscription_item);

                        const proration =
                            line.parent
                                ?.subscription_item_details
                                ?.proration === true ||
                            line.proration === true;

                        if (
                            linePriceId === priceId &&
                            lineItemId === item.id &&
                            !proration &&
                            line.currency === "usd" &&
                            Number(line.amount) > 0 &&
                            Number.isInteger(line.period?.start) &&
                            Number.isInteger(line.period?.end) &&
                            line.period.end >
                            line.period.start
                        ) {
                            verifiedPaidPeriodEnd =
                                line.period.end;

                            verifiedPaidThrough =
                                toMysqlDate(line.period.end);

                            break;
                        }
                    }

                    if (!verifiedPaidThrough) {
                        throw new Error(
                            `Paid invoice lacks matching service period: ${invoice.id}`
                        );
                    }
                }
            }
        }

        await connection.beginTransaction();
        inTransaction = true;

        const [inserted] = await connection.execute(
            `INSERT IGNORE INTO stripe_webhook_events
             (stripe_event_id, event_type)
             VALUES (?, ?)`,
            [event.id, event.type]
        );

        // Recover a previously acknowledged invoice.paid
        // that older code stored without granting entitlement.
        const replayRepair =
            inserted.affectedRows === 0 &&
            event.type === "invoice.paid" &&
            !!verifiedPaidThrough;

        if (
            inserted.affectedRows === 0 &&
            !replayRepair
        ) {
            await connection.rollback();
            inTransaction = false;

            return res.json({
                received: true,
                duplicate: true,
            });
        }

        const [customers] = await connection.execute(
            `SELECT stripe_customer_id
             FROM stripe_customers
             WHERE user_id = ?
               AND stripe_mode = 'test'
             LIMIT 1 FOR UPDATE`,
            [userId]
        );

        if (
            customers.length &&
            customers[0].stripe_customer_id !== customerId
        ) {
            throw new Error(
                "Stripe customer ownership mismatch"
            );
        }

        if (!customers.length) {
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
                current_period_end =
                    VALUES(current_period_end),
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
                toMysqlDate(currentPeriodEnd),
                subscription.cancel_at_period_end ? 1 : 0,
                toMysqlDate(subscription.ended_at),
            ]
        );

        if (verifiedPaidThrough) {
            const [records] = await connection.execute(
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

            if (!records.length) {
                throw new Error(
                    "Subscription mapping missing"
                );
            }

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
                    records[0].id,
                ]
            );

            if (
                verifiedPaidPeriodEnd >
                Math.floor(Date.now() / 1000) &&
                subscription.status === "active" &&
                subscription.ended_at == null
            ) {
                await connection.execute(
                    `INSERT INTO course_enrollments (
                        user_id,
                        course_id,
                        status,
                        access_source,
                        enrolled_at
                     )
                     VALUES (
                        ?, ?, 'active', 'stripe',
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
        }

        await connection.commit();
        inTransaction = false;

        return res.json({
            received: true,
            recovered: replayRepair,
        });
    } catch (error) {
        if (connection && inTransaction) {
            await connection.rollback().catch(() => { });
        }

        console.error(
            "Stripe webhook processing error:",
            error
        );

        return res.status(500).json({
            error: "Webhook processing failed",
        });
    } finally {
        if (connection) {
            if (lockAcquired) {
                try {
                    const [rows] = await connection.execute(
                        "SELECT RELEASE_LOCK(?) AS released",
                        [lockName]
                    );

                    if (Number(rows[0]?.released) !== 1) {
                        throw new Error(
                            "Webhook lock release not confirmed"
                        );
                    }
                } catch (error) {
                    console.error(
                        "Stripe webhook lock release failed:",
                        error
                    );

                    connection.destroy();
                    connection = null;
                }
            }

            connection?.release();
        }
    }
};
