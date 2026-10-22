
import "dotenv/config";
import Stripe from "stripe";

let stripeClient = null;

export function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error("Stripe secret key missing");
    }

    // Sandbox only — block live keys during development
    if (!secretKey.startsWith("sk_test_")) {
        throw new Error("Only Stripe test keys are allowed");
    }

    if (!stripeClient) {
        stripeClient = new Stripe(secretKey);
    }

    return stripeClient;
}
// c