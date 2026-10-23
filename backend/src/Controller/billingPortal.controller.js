
import "dotenv/config";
import db from "../DB/db.js";
import { getStripe } from "../Services/stripeClient.js";

export const createBillingPortalSession = async (
    req,
    res
) => {
    try {
        // Sandbox only
        if (
            process.env.STRIPE_CHECKOUT_TEST_ENABLED !== "true" ||
            !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
        ) {
            return res.status(503).json({
                success: false,
                message: "Test billing portal is not enabled.",
            });
        }

        const configuredUrl =
            process.env.STRIPE_FRONTEND_URL;

        if (!configuredUrl) {
            return res.status(503).json({
                success: false,
                message: "Frontend URL is not configured.",
            });
        }

        let frontend;
        let returnUrl;

        try {
            frontend = new URL(configuredUrl);

            if (
                frontend.protocol !== "https:" &&
                frontend.hostname !== "localhost"
            ) {
                throw new Error("Invalid frontend protocol");
            }

            returnUrl = new URL(
                process.env.STRIPE_PORTAL_RETURN_URL ||
                frontend.origin,
                frontend.origin
            );

            if (returnUrl.origin !== frontend.origin) {
                throw new Error("Invalid return URL origin");
            }
        } catch {
            return res.status(503).json({
                success: false,
                message: "Invalid billing portal configuration.",
            });
        }

        // CSRF protection for cookie-based authentication
        if (req.get("origin") !== frontend.origin) {
            return res.status(403).json({
                success: false,
                message: "Invalid request origin.",
            });
        }

        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        // Never accept Stripe Customer ID from client.
        const [customers] = await db.execute(
            `SELECT stripe_customer_id
             FROM stripe_customers
             WHERE user_id = ?
               AND stripe_mode = 'test'
             LIMIT 1`,
            [userId]
        );

        if (!customers.length) {
            return res.status(404).json({
                success: false,
                code: "NO_BILLING_CUSTOMER",
                message:
                    "No billing account found. Subscribe to a course first.",
            });
        }

        const stripeCustomerId =
            customers[0].stripe_customer_id;

        const stripe = getStripe();

        const customer =
            await stripe.customers.retrieve(
                stripeCustomerId
            );

        if (
            customer.deleted ||
            customer.livemode !== false ||
            (
                customer.metadata?.lms_user_id &&
                customer.metadata.lms_user_id !== String(userId)
            )
        ) {
            return res.status(409).json({
                success: false,
                message: "Billing account verification failed.",
            });
        }

        const session =
            await stripe.billingPortal.sessions.create({
                customer: stripeCustomerId,
                return_url: returnUrl.href,
            });

        return res.status(200).json({
            success: true,
            portalUrl: session.url,
        });
    } catch (error) {
        console.error(
            "Stripe billing portal error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to open billing portal.",
        });
    }
};
