import ApiError from "../../../errors/ApiError";
import Stripe from "stripe";
import config from "../../../config";
// Initialize Stripe
const stripe = new Stripe(config.stripe_secret_key, {
    apiVersion: "2025-12-15.clover",
});
// Create Stripe checkout session
const createCheckoutSession = async (params) => {
    try {
        const { items, customer_email, success_url, cancel_url } = params;
        if (!items || items.length === 0) {
            throw new ApiError(400, "No items in cart");
        }
        // Transform items to Stripe line_items format
        const line_items = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${item.name} - ${item.mg}mg`,
                    description: `Research Peptide - ${item.mg}mg`,
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));
        // Add shipping as a line item
        const shippingCost = 695; // $6.95 in cents
        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Shipping",
                    description: "Standard Shipping",
                },
                unit_amount: shippingCost,
            },
            quantity: 1,
        });
        // Build session parameters
        const sessionParams = {
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${cancel_url}?t=${Date.now()}`,
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "GB", "AU"],
            },
            metadata: {
                items: JSON.stringify(items),
            },
        };
        // Add customer_email if provided
        if (customer_email) {
            sessionParams.customer_email = customer_email;
            sessionParams.metadata.customer_email = customer_email;
        }
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create(sessionParams);
        return {
            sessionId: session.id,
            url: session.url,
        };
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to create checkout session");
    }
};
// Verify Stripe session
const verifySession = async (sessionId) => {
    try {
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["line_items"],
        });
        if (!session) {
            throw new ApiError(404, "Session not found");
        }
        // Return session details
        return {
            session: {
                id: session.id,
                status: session.status,
                payment_status: session.payment_status,
                customer_email: session.customer_email,
                amount_total: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency,
                created: new Date(session.created * 1000).toISOString(),
            },
            line_items: session.line_items?.data.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                amount: item.amount_total ? item.amount_total / 100 : 0,
            })) || [],
        };
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to verify session");
    }
};
export const checkoutServices = {
    createCheckoutSession,
    verifySession,
};
//# sourceMappingURL=checkout.services.js.map