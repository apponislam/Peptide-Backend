import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { shipStationService } from "../shipstation/shipstation.service";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
});
export class StripeService {
    // Calculate order summary
    calculateOrderSummary(items, userStoreCredit = 0, shippingCost = 0) {
        const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = 0; // You can implement discount logic here
        const subtotalAfterDiscount = originalSubtotal - discount;
        const storeCreditsApplied = Math.min(userStoreCredit, subtotalAfterDiscount);
        const totalBeforeShipping = subtotalAfterDiscount - storeCreditsApplied;
        const total = totalBeforeShipping + shippingCost;
        return {
            originalSubtotal,
            discount,
            shipping: shippingCost,
            storeCreditsApplied,
            total,
        };
    }
    // Create a checkout session
    async createCheckoutSession(userId, items, shippingInfo, metadata = {}) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            const orderSummary = this.calculateOrderSummary(items, user.storeCredit);
            const lineItems = items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        description: item.description,
                        images: item.image ? [item.image] : [],
                        metadata: {
                            productId: item.productId.toString(),
                        },
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }));
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
                customer_email: shippingInfo.email,
                // shipping_address_collection: {
                //     allowed_countries: ["US", "CA"],
                // },
                billing_address_collection: "required",
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: "fixed_amount",
                            fixed_amount: {
                                amount: 0,
                                currency: "usd",
                            },
                            display_name: "Standard Shipping",
                        },
                    },
                ],
                metadata: {
                    userId,
                    shippingName: shippingInfo.name,
                    shippingEmail: shippingInfo.email,
                    shippingPhone: shippingInfo.phone,
                    shippingAddress: shippingInfo.address,
                    shippingCity: shippingInfo.city,
                    shippingState: shippingInfo.state,
                    shippingZip: shippingInfo.zip,
                    shippingCountry: shippingInfo.country,
                    ...metadata,
                    orderSummary: JSON.stringify(orderSummary),
                },
                phone_number_collection: {
                    enabled: true,
                },
            });
            const checkoutSession = await prisma.checkoutSession.create({
                data: {
                    id: session.id,
                    userId,
                    stripeSessionId: session.id,
                    paymentStatus: "PENDING",
                },
            });
            return {
                sessionId: session.id,
                url: session.url,
                checkoutSession,
                orderSummary,
            };
        }
        catch (error) {
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
    // Process webhook events (called by webhook controller)
    async processWebhookEvent(event) {
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case "checkout.session.expired":
                    await this.handleCheckoutSessionExpired(event.data.object);
                    break;
                case "checkout.session.async_payment_succeeded":
                    await this.handleAsyncPaymentSucceeded(event.data.object);
                    break;
                case "checkout.session.async_payment_failed":
                    await this.handleAsyncPaymentFailed(event.data.object);
                    break;
            }
        }
        catch (error) {
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }
    async handleCheckoutSessionCompleted(session) {
        const userId = session.metadata?.userId;
        if (!userId) {
            throw new Error("No userId in session metadata");
        }
        try {
            // Get shipping from metadata (individual fields, not JSON)
            const shippingInfo = {
                name: session.metadata?.shippingName || "",
                email: session.metadata?.shippingEmail || "",
                phone: session.metadata?.shippingPhone || "",
                address: session.metadata?.shippingAddress || "",
                city: session.metadata?.shippingCity || "",
                state: session.metadata?.shippingState || "",
                zip: session.metadata?.shippingZip || "",
                country: session.metadata?.shippingCountry || "US",
            };
            // Update checkout session
            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: {
                    paymentStatus: "PAID",
                    updatedAt: new Date(),
                },
            });
            // Create order WITH shipping info
            const order = await this.createOrderFromSession(session, userId, shippingInfo);
            // Link checkout session to order
            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: { orderId: order.id },
            });
            // Process commissions
            await this.processCommissions(order);
            // Create ShipStation order (with try-catch so it doesn't break)
            try {
                await shipStationService.createOrder(order.id);
            }
            catch (shipstationError) {
                console.error("ShipStation error (non-fatal):", shipstationError);
                // Don't throw - let order be created even if ShipStation fails
            }
        }
        catch (error) {
            console.error("Error handling checkout session completed:", error);
            throw error;
        }
    }
    async createOrderFromSession(session, userId, shippingInfo) {
        try {
            const sessionDetails = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["line_items.data.price.product"],
            });
            const lineItems = sessionDetails.line_items?.data || [];
            // Use shippingInfo from metadata (your form)
            const order = await prisma.order.create({
                data: {
                    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    // Use shippingInfo from your form
                    name: shippingInfo.name,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zip: shippingInfo.zip,
                    country: shippingInfo.country,
                    // Calculate prices
                    originalPrice: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    discountAmount: 0, // You need to calculate this
                    discountPercentage: 0,
                    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    shipping: session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0,
                    creditApplied: 0, // Calculate from metadata
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: "PAID",
                    commissionAmount: 0,
                    commissionPaid: false,
                },
            });
            // Create order items
            for (const item of lineItems) {
                const productId = this.extractProductIdFromLineItem(item);
                if (productId > 0) {
                    // Fetch product to get price from sizes
                    const product = await prisma.product.findUnique({
                        where: { id: productId },
                    });
                    let unitPrice = 0;
                    if (product?.sizes) {
                        const sizes = JSON.parse(JSON.stringify(product.sizes));
                        if (Array.isArray(sizes) && sizes.length > 0) {
                            unitPrice = sizes[0]?.price || 0;
                        }
                    }
                    await prisma.orderItem.create({
                        data: {
                            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            orderId: order.id,
                            productId,
                            quantity: item.quantity || 1,
                            unitPrice: unitPrice,
                            discountedPrice: item.amount_total ? item.amount_total / 100 : 0,
                        },
                    });
                }
            }
            return order;
        }
        catch (error) {
            console.error("Error creating order from session:", error);
            throw error;
        }
    }
    extractProductIdFromLineItem(item) {
        // Try price metadata first
        if (item.price?.metadata?.productId) {
            const id = parseInt(item.price.metadata.productId);
            if (!isNaN(id))
                return id;
        }
        // Try product metadata if expanded
        if (item.price?.product && typeof item.price.product !== "string") {
            const product = item.price.product;
            if (product.metadata?.productId) {
                const id = parseInt(product.metadata.productId);
                if (!isNaN(id))
                    return id;
            }
        }
        // Try to extract from description
        if (item.description) {
            const match = item.description.match(/\d+/);
            if (match) {
                const id = parseInt(match[0]);
                if (!isNaN(id))
                    return id;
            }
        }
        return 0;
    }
    async processCommissions(order) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: order.userId },
                include: { referrer: true },
            });
            if (user?.isReferralValid && user.referrer) {
                const commissionAmount = (order.subtotal - order.creditApplied) * 0.1;
                await prisma.commission.create({
                    data: {
                        id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        orderId: order.id,
                        referrerId: user.referrer.id,
                        buyerId: user.id,
                        amount: commissionAmount,
                        status: "PENDING",
                    },
                });
                await prisma.user.update({
                    where: { id: user.referrer.id },
                    data: {
                        referralCount: { increment: 1 },
                    },
                });
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        commissionAmount,
                    },
                });
            }
        }
        catch (error) {
            console.error("Error processing commissions:", error);
        }
    }
    async updateUserStoreCredit(userId, creditUsed) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    storeCredit: {
                        decrement: creditUsed,
                    },
                },
            });
        }
        catch (error) {
            console.error("Error updating user store credit:", error);
        }
    }
    async handleCheckoutSessionExpired(session) {
        try {
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error("Error handling expired session:", error);
        }
    }
    async handleAsyncPaymentSucceeded(session) {
        await this.handleCheckoutSessionCompleted(session);
    }
    async handleAsyncPaymentFailed(session) {
        try {
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error("Error handling async payment failed:", error);
        }
    }
    async createPaymentIntent(amount, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: "usd",
                metadata,
            });
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        }
        catch (error) {
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }
    async createRefund(paymentIntentId, amount) {
        try {
            // Prepare the refund parameters
            const refundParams = {
                payment_intent: paymentIntentId,
            };
            // Only add amount if it's provided
            if (amount !== undefined) {
                refundParams.amount = Math.round(amount * 100);
            }
            const refund = await stripe.refunds.create(refundParams);
            return refund;
        }
        catch (error) {
            throw new Error(`Failed to create refund: ${error.message}`);
        }
    }
    async getSessionStatus(sessionId) {
        try {
            const session = (await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ["line_items.data.price.product"],
            }));
            return {
                status: session.status,
                paymentStatus: session.payment_status,
                customerDetails: session.customer_details,
                shipping: session.shipping,
                shippingCost: session.shipping_cost,
                amountTotal: session.amount_total ? session.amount_total / 100 : 0,
            };
        }
        catch (error) {
            throw new Error(`Failed to get session status: ${error.message}`);
        }
    }
}
export const stripeService = new StripeService();
//# sourceMappingURL=payment.service.js.map