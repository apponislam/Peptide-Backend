import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { shipStationService } from "../shipstation/shipstation.service";
import { CheckoutItem, EnhancedStripeSession, OrderSummary, ShippingInfo } from "./payment.types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
});

export class StripeService {
    // Calculate order summary
    private calculateOrderSummary(items: CheckoutItem[], userStoreCredit: number = 0, shippingCost: number = 0): OrderSummary {
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
    async createCheckoutSession(userId: string, items: CheckoutItem[], shippingInfo: ShippingInfo, metadata: Record<string, any> = {}) {
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
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
                metadata: {
                    userId,
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
        } catch (error: any) {
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }

    // Process webhook events (called by webhook controller)
    async processWebhookEvent(event: Stripe.Event) {
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await this.handleCheckoutSessionCompleted(event.data.object as EnhancedStripeSession);
                    break;

                case "checkout.session.expired":
                    await this.handleCheckoutSessionExpired(event.data.object as EnhancedStripeSession);
                    break;

                case "checkout.session.async_payment_succeeded":
                    await this.handleAsyncPaymentSucceeded(event.data.object as EnhancedStripeSession);
                    break;

                case "checkout.session.async_payment_failed":
                    await this.handleAsyncPaymentFailed(event.data.object as EnhancedStripeSession);
                    break;
            }
        } catch (error: any) {
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }

    async handleCheckoutSessionCompleted(session: EnhancedStripeSession) {
        const userId = session.metadata?.userId;
        const orderSummary = session.metadata?.orderSummary ? JSON.parse(session.metadata.orderSummary) : null;

        if (!userId) {
            throw new Error("No userId in session metadata");
        }

        try {
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    paymentStatus: "PAID",
                    updatedAt: new Date(),
                },
            });

            const order = await this.createOrderFromSession(session, userId, orderSummary);

            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: { orderId: order.id },
            });

            await shipStationService.createOrder(order.id);
            await this.processCommissions(order);

            if (orderSummary?.storeCreditsApplied > 0) {
                await this.updateUserStoreCredit(userId, orderSummary.storeCreditsApplied);
            }
        } catch (error) {
            console.error("Error handling checkout session completed:", error);
            throw error;
        }
    }

    private async createOrderFromSession(session: EnhancedStripeSession, userId: string, orderSummary: OrderSummary | null) {
        try {
            const sessionDetails = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["line_items.data.price.product"],
            });

            const lineItems = sessionDetails.line_items?.data || [];

            // Extract customer details
            const customerDetails = session.customer_details;
            const customerName = customerDetails?.name || "";
            const customerEmail = customerDetails?.email || "";
            const customerPhone = customerDetails?.phone || "";

            // Extract shipping details
            const shipping = session.shipping;
            const shippingAddress = shipping?.address;
            const shippingName = shipping?.name || customerName;

            // Calculate shipping cost
            const shippingCost = session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0;

            // Calculate totals
            const stripeSubtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
            const stripeTotal = session.amount_total ? session.amount_total / 100 : 0;
            const stripeShipping = shippingCost || 0;
            const stripeDiscount = Math.max(0, stripeSubtotal - (stripeTotal - stripeShipping));

            const order = await prisma.order.create({
                data: {
                    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    name: shippingName,
                    email: customerEmail,
                    phone: customerPhone,
                    address: shippingAddress?.line1 || "",
                    city: shippingAddress?.city || "",
                    state: shippingAddress?.state || "",
                    zip: shippingAddress?.postal_code || "",
                    country: shippingAddress?.country || "",
                    originalPrice: orderSummary?.originalSubtotal || stripeSubtotal,
                    discountAmount: orderSummary?.discount || stripeDiscount,
                    discountPercentage: orderSummary?.discount && orderSummary.originalSubtotal && orderSummary.originalSubtotal > 0 ? (orderSummary.discount / orderSummary.originalSubtotal) * 100 : stripeDiscount > 0 && stripeSubtotal > 0 ? (stripeDiscount / stripeSubtotal) * 100 : 0,
                    subtotal: (orderSummary?.originalSubtotal || stripeSubtotal) - (orderSummary?.discount || stripeDiscount),
                    shipping: stripeShipping,
                    creditApplied: orderSummary?.storeCreditsApplied || 0,
                    total: orderSummary?.total || stripeTotal,
                    status: "PAID",
                    commissionAmount: 0,
                    commissionPaid: false,
                },
            });

            for (const item of lineItems) {
                const productId = this.extractProductIdFromLineItem(item);

                if (productId > 0) {
                    await prisma.orderItem.create({
                        data: {
                            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            orderId: order.id,
                            productId,
                            quantity: item.quantity || 1,
                            unitPrice: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
                            discountedPrice: item.amount_total ? item.amount_total / 100 : 0,
                        },
                    });
                }
            }

            return order;
        } catch (error) {
            console.error("Error creating order from session:", error);
            throw error;
        }
    }

    private extractProductIdFromLineItem(item: Stripe.LineItem): number {
        // Try price metadata first
        if (item.price?.metadata?.productId) {
            const id = parseInt(item.price.metadata.productId);
            if (!isNaN(id)) return id;
        }

        // Try product metadata if expanded
        if (item.price?.product && typeof item.price.product !== "string") {
            const product = item.price.product as Stripe.Product;
            if (product.metadata?.productId) {
                const id = parseInt(product.metadata.productId);
                if (!isNaN(id)) return id;
            }
        }

        // Try to extract from description
        if (item.description) {
            const match = item.description.match(/\d+/);
            if (match) {
                const id = parseInt(match[0]);
                if (!isNaN(id)) return id;
            }
        }

        return 0;
    }

    private async processCommissions(order: any) {
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
        } catch (error) {
            console.error("Error processing commissions:", error);
        }
    }

    private async updateUserStoreCredit(userId: string, creditUsed: number) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    storeCredit: {
                        decrement: creditUsed,
                    },
                },
            });
        } catch (error) {
            console.error("Error updating user store credit:", error);
        }
    }

    private async handleCheckoutSessionExpired(session: EnhancedStripeSession) {
        try {
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Error handling expired session:", error);
        }
    }

    private async handleAsyncPaymentSucceeded(session: EnhancedStripeSession) {
        await this.handleCheckoutSessionCompleted(session);
    }

    private async handleAsyncPaymentFailed(session: EnhancedStripeSession) {
        try {
            await prisma.checkoutSession.update({
                where: { id: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Error handling async payment failed:", error);
        }
    }

    async createPaymentIntent(amount: number, metadata: Record<string, any> = {}) {
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
        } catch (error: any) {
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    async createRefund(paymentIntentId: string, amount?: number) {
        try {
            // Prepare the refund parameters
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: paymentIntentId,
            };

            // Only add amount if it's provided
            if (amount !== undefined) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await stripe.refunds.create(refundParams);
            return refund;
        } catch (error: any) {
            throw new Error(`Failed to create refund: ${error.message}`);
        }
    }

    async getSessionStatus(sessionId: string): Promise<any> {
        try {
            const session = (await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ["line_items.data.price.product"],
            })) as EnhancedStripeSession;

            return {
                status: session.status,
                paymentStatus: session.payment_status,
                customerDetails: session.customer_details,
                shipping: session.shipping,
                shippingCost: session.shipping_cost,
                amountTotal: session.amount_total ? session.amount_total / 100 : 0,
            };
        } catch (error: any) {
            throw new Error(`Failed to get session status: ${error.message}`);
        }
    }
}

export const stripeService = new StripeService();
