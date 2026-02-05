import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { shipStationService } from "../shipstation/shipstation.service";
import { CheckoutItem, EnhancedStripeSession, OrderSummary, ShippingInfo } from "./payment.types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil" as any,
});

export class StripeService {
    // Calculate order summary
    private calculateOrderSummary(items: CheckoutItem[], userStoreCredit: number = 0, shippingCost: number = 0): OrderSummary {
        const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = 0;
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

    // Calculate shipping cost based on user tier and shipping credit
    private async calculateShippingCost(user: any, items: CheckoutItem[], shippingAmountFromRequest: number): Promise<number> {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const SHIPPING_RATE = 6.95;

        // Founder/VIP: Always free shipping
        if (user.tier === "Founder" || user.tier === "VIP") {
            return 0;
        }

        // Member: Check shipping credit
        if (user.tier === "Member" && user.shippingCredit > 0) {
            if (user.shippingCredit >= SHIPPING_RATE) {
                return 0;
            } else {
                return SHIPPING_RATE - user.shippingCredit;
            }
        }

        // No shipping credit or other tiers: Check subtotal
        if (subtotal >= 150) return 0;

        return SHIPPING_RATE;
    }

    // Create a checkout session - UPDATED with storeCreditUsed
    async createCheckoutSession(userId: string, items: CheckoutItem[], shippingInfo: ShippingInfo, shippingAmount: number, subtotal: number, storeCreditUsed: number, total: number, metadata: Record<string, any> = {}) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Validate store credit usage
            if (storeCreditUsed > user.storeCredit) {
                throw new Error(`Insufficient store credit. Available: $${user.storeCredit}, Requested: $${storeCreditUsed}`);
            }

            // Calculate shipping cost based on user data
            const calculatedShipping = await this.calculateShippingCost(user, items, shippingAmount);
            const orderSummary = this.calculateOrderSummary(items, user.storeCredit, calculatedShipping);

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
                    unit_amount: Math.round(item.price * 100), // Frontend sends adjusted prices
                },
                quantity: item.quantity,
            }));

            // Create shipping options based on calculated cost
            const shippingOptions: any[] = [];

            if (calculatedShipping === 0) {
                shippingOptions.push({
                    shipping_rate_data: {
                        type: "fixed_amount" as const,
                        fixed_amount: {
                            amount: 0,
                            currency: "usd",
                        },
                        display_name: "Free Shipping",
                    },
                });
            } else {
                shippingOptions.push({
                    shipping_rate_data: {
                        type: "fixed_amount" as const,
                        fixed_amount: {
                            amount: Math.round(calculatedShipping * 100),
                            currency: "usd",
                        },
                        display_name: "Standard Shipping",
                    },
                });
            }

            // Reserve store credit immediately
            if (storeCreditUsed > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        storeCredit: {
                            decrement: parseFloat(storeCreditUsed.toFixed(2)),
                        },
                    },
                });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
                customer_email: shippingInfo.email,
                billing_address_collection: "required",
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
                shipping_options: shippingOptions,
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
                    userShippingCredit: user.shippingCredit || 0,
                    userTier: user.tier,
                    calculatedShipping: calculatedShipping.toString(),
                    frontendShippingAmount: shippingAmount.toString(),
                    frontendSubtotal: subtotal.toString(),
                    frontendTotal: total.toString(),
                    storeCreditUsed: storeCreditUsed.toString(), // NEW: Track store credit used
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
                    storeCreditUsed, // NEW: Store in checkout session
                },
            });

            return {
                sessionId: session.id,
                url: session.url,
                checkoutSession,
                orderSummary,
                shippingCost: calculatedShipping,
                storeCreditUsed, // Return for frontend
            };
        } catch (error: any) {
            // Restore store credit if failed
            if (storeCreditUsed > 0 && userId) {
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            storeCredit: {
                                increment: storeCreditUsed,
                            },
                        },
                    });
                } catch (restoreError) {
                    console.error("Failed to restore store credit:", restoreError);
                }
            }
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }

    // Process webhook events
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

                // case "payment_intent.succeeded":
                //     // Update order status if needed
                //     break;

                // case "payment_intent.payment_failed":
                //     // Update order status to FAILED
                //     break;
            }
        } catch (error: any) {
            throw new Error(`Failed to process webhook event: ${error.message}`);
        }
    }

    async handleCheckoutSessionCompleted(session: EnhancedStripeSession) {
        const userId = session.metadata?.userId;

        if (!userId) {
            throw new Error("No userId in session metadata");
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Get shipping from metadata
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

            // Parse data from metadata
            const shippingCost = parseFloat(session.metadata?.calculatedShipping || "0");
            const userShippingCredit = parseFloat(session.metadata?.userShippingCredit || "0");
            const userTier = session.metadata?.userTier || "Member";
            const storeCreditUsed = parseFloat(session.metadata?.storeCreditUsed || "0"); // NEW

            // Update user shipping credit if they used it
            if (userTier === "Member" && userShippingCredit > 0 && shippingCost === 0) {
                const creditUsed = Math.min(userShippingCredit, 6.95);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        shippingCredit: {
                            decrement: creditUsed,
                        },
                    },
                });
            } else if (userTier === "Member" && userShippingCredit > 0 && shippingCost > 0) {
                const creditUsed = 6.95 - shippingCost;
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        shippingCredit: {
                            decrement: creditUsed,
                        },
                    },
                });
            }

            // Update checkout session
            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: {
                    paymentStatus: "PAID",
                    updatedAt: new Date(),
                },
            });

            // Create order WITH shipping info
            const order = await this.createOrderFromSession(session, userId, shippingInfo, shippingCost, storeCreditUsed); // UPDATED

            // Link checkout session to order
            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: { orderId: order.id },
            });

            // Process commissions
            await this.processCommissions(order);

            // Create ShipStation order
            try {
                await shipStationService.createOrder(order.id);
            } catch (shipstationError) {
                console.error("ShipStation error (non-fatal):", shipstationError);
            }
        } catch (error) {
            console.error("Error handling checkout session completed:", error);
            // Restore store credit if order creation fails
            const storeCreditUsed = parseFloat(session.metadata?.storeCreditUsed || "0");
            if (storeCreditUsed > 0 && userId) {
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            storeCredit: {
                                increment: storeCreditUsed,
                            },
                        },
                    });
                } catch (restoreError) {
                    console.error("Failed to restore store credit:", restoreError);
                }
            }
            throw error;
        }
    }

    private async createOrderFromSession(session: EnhancedStripeSession, userId: string, shippingInfo: any, shippingCost: number, storeCreditUsed: number) {
        try {
            const sessionDetails = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["line_items.data.price.product", "payment_intent"],
            });

            const lineItems = sessionDetails.line_items?.data || [];
            let paymentIntentId: string;

            if (typeof sessionDetails.payment_intent === "string") {
                paymentIntentId = sessionDetails.payment_intent;
            } else if (sessionDetails.payment_intent && typeof sessionDetails.payment_intent === "object") {
                paymentIntentId = sessionDetails.payment_intent.id;
            } else {
                // If no payment intent, use a placeholder
                paymentIntentId = `no-pi-${Date.now()}`;
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    paymentIntentId: paymentIntentId,
                    userId,
                    name: shippingInfo.name,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zip: shippingInfo.zip,
                    country: shippingInfo.country,
                    originalPrice: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    discountAmount: 0,
                    discountPercentage: 0,
                    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    shipping: shippingCost,
                    creditApplied: storeCreditUsed, // NEW: Store credit applied
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
            console.log("=== PROCESSING COMMISSIONS START ===");
            console.log("Order ID:", order.id);
            console.log("Order Subtotal:", order.subtotal);
            console.log("Store Credit Used:", order.creditApplied); // NEW: Log store credit

            const user = await prisma.user.findUnique({
                where: { id: order.userId },
                include: { referrer: true },
            });

            console.log("User found:", user?.id);
            console.log("User isReferralValid BEFORE:", user?.isReferralValid);
            console.log("User referrer:", user?.referrer?.id);

            if (user?.referrer) {
                const isFirstPurchase = !user.isReferralValid;

                if (isFirstPurchase) {
                    console.log("🎯 FIRST PURCHASE - Validating referral");

                    const currentCount = user.referrer.referralCount;
                    const currentTier = user.referrer.tier;
                    const newCount = currentCount + 1;

                    let newTier = currentTier;
                    if (newCount >= 10 && currentTier !== "Founder") {
                        newTier = "Founder";
                    } else if (newCount >= 3 && currentTier === "Member") {
                        newTier = "VIP";
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { isReferralValid: true },
                    });

                    const updateData: any = { referralCount: { increment: 1 } };
                    if (newTier !== currentTier) {
                        updateData.tier = newTier;
                    }

                    await prisma.user.update({
                        where: { id: user.referrer.id },
                        data: updateData,
                    });

                    console.log("✅ Referral validated and count incremented");
                } else {
                    console.log("📦 Repeat purchase - referral already counted");
                }

                const commissionRates = {
                    Founder: 0.15,
                    VIP: 0.1,
                    Member: 0,
                };

                const commissionRate = commissionRates[user.referrer.tier] || 0;

                if (commissionRate > 0) {
                    const commissionAmount = order.subtotal * commissionRate;
                    console.log("💰 Commission Amount:", commissionAmount);

                    await prisma.user.update({
                        where: { id: user.referrer.id },
                        data: {
                            storeCredit: {
                                increment: parseFloat(commissionAmount.toFixed(2)),
                            },
                        },
                    });
                    console.log("✅ Commission added to referrer's store credit");

                    const commissionId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await prisma.commission.create({
                        data: {
                            id: commissionId,
                            orderId: order.id,
                            referrerId: user.referrer.id,
                            buyerId: user.id,
                            amount: commissionAmount,
                            status: "PAID",
                        },
                    });
                    console.log("✅ Created commission record:", commissionId);

                    await prisma.order.update({
                        where: { id: order.id },
                        data: { commissionAmount },
                    });
                    console.log("✅ Updated order with commission amount");
                } else {
                    console.log("📊 No commission for this tier");
                }
            } else {
                console.log("❌ No referrer found");
            }

            console.log("=== PROCESSING COMMISSIONS END ===");
        } catch (error) {
            console.error("❌ Error processing commissions:", error);
        }
    }

    // Restore store credit on cancel/expire
    private async handleCheckoutSessionExpired(session: EnhancedStripeSession) {
        try {
            const userId = session.metadata?.userId;
            const storeCreditUsed = parseFloat(session.metadata?.storeCreditUsed || "0");

            // Restore store credit
            if (storeCreditUsed > 0 && userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        storeCredit: {
                            increment: storeCreditUsed,
                        },
                    },
                });
            }

            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Error handling expired session:", error);
        }
    }

    // Restore store credit on payment failure
    private async handleAsyncPaymentFailed(session: EnhancedStripeSession) {
        try {
            const userId = session.metadata?.userId;
            const storeCreditUsed = parseFloat(session.metadata?.storeCreditUsed || "0");

            // Restore store credit
            if (storeCreditUsed > 0 && userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        storeCredit: {
                            increment: storeCreditUsed,
                        },
                    },
                });
            }

            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: {
                    paymentStatus: "FAILED",
                    updatedAt: new Date(),
                },
            });

            const checkoutSession = await prisma.checkoutSession.findUnique({
                where: { stripeSessionId: session.id },
            });

            if (checkoutSession?.orderId) {
                await prisma.order.update({
                    where: { id: checkoutSession.orderId },
                    data: { status: "FAILED" },
                });
            }
        } catch (error) {
            console.error("Error handling async payment failed:", error);
        }
    }

    private async handleAsyncPaymentSucceeded(session: EnhancedStripeSession) {
        await this.handleCheckoutSessionCompleted(session);
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

    async createRefund(orderId: string, amount?: number) {
        try {
            // Find order by orderId
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error("Order not found");
            }

            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: order.paymentIntentId,
            };

            if (amount !== undefined) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await stripe.refunds.create(refundParams);

            // Update order status
            await prisma.order.update({
                where: { id: orderId },
                // data: { status: "CANCELLED" },
                data: { status: "REFUNDED" },
            });

            // Restore store credit if used
            if (order.creditApplied > 0) {
                await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                        storeCredit: {
                            increment: order.creditApplied,
                        },
                    },
                });
            }

            return {
                stripeRefund: refund,
                orderId: order.id,
                storeCreditRestored: order.creditApplied,
            };
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
