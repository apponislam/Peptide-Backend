import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { shipStationService } from "../shipstation/shipstation.service";
import { CheckoutItem, EnhancedStripeSession, OrderSummary, ShippingInfo } from "./payment.types";
import { sendOrderConfirmationEmail, sendOrderRefundedEmail } from "../../../utils/templates/orderEmailTemplate";

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

    // REMOVED calculateShippingCost - shipping is now handled entirely by frontend

    async createCheckoutSession(userId: string, items: CheckoutItem[], shippingAmount: number, subtotal: number, storeCreditUsed: number, total: number, metadata: Record<string, any> = {}) {
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

            // Use shipping amount directly from frontend
            const calculatedShipping = shippingAmount;
            const orderSummary = this.calculateOrderSummary(items, user.storeCredit, calculatedShipping);

            const lineItems = items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        description: item.description,
                        metadata: {
                            productId: item.productId.toString(),
                            size: item.size || "",
                        },
                    },
                    unit_amount: Math.round(item.price * 100),
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
                customer_email: user.email,

                // CRITICAL: These must be set to collect shipping
                billing_address_collection: "required",
                shipping_address_collection: {
                    allowed_countries: ["US", "CA"],
                },
                shipping_options: shippingOptions,

                // Collect phone number
                phone_number_collection: {
                    enabled: true,
                },

                metadata: {
                    userId,
                    userTier: user.tier,
                    calculatedShipping: calculatedShipping.toString(),
                    frontendShippingAmount: shippingAmount.toString(),
                    frontendSubtotal: subtotal.toString(),
                    frontendTotal: total.toString(),
                    storeCreditUsed: storeCreditUsed.toString(),
                    items: JSON.stringify(
                        items.map((item) => ({
                            productId: item.productId,
                            size: item.size,
                            quantity: item.quantity,
                        })),
                    ),
                    ...metadata,
                    orderSummary: JSON.stringify(orderSummary),
                },
            });

            const checkoutSession = await prisma.checkoutSession.create({
                data: {
                    id: session.id,
                    userId,
                    stripeSessionId: session.id,
                    paymentStatus: "PENDING",
                    storeCreditUsed,
                },
            });

            return {
                sessionId: session.id,
                url: session.url,
                checkoutSession,
                orderSummary,
                shippingCost: calculatedShipping,
                storeCreditUsed,
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

            // Parse data from metadata
            const shippingCost = parseFloat(session.metadata?.calculatedShipping || "0");
            const userTier = session.metadata?.userTier || "Member";
            const storeCreditUsed = parseFloat(session.metadata?.storeCreditUsed || "0");

            // Parse items from metadata
            let items: any[] = [];
            try {
                if (session.metadata?.items) {
                    items = JSON.parse(session.metadata.items);
                } else if (session.metadata?.itemDetails) {
                    items = JSON.parse(session.metadata.itemDetails);
                }
            } catch (e) {
                console.error("Failed to parse items from metadata:", e);
            }

            // REMOVED shipping credit update logic

            // Update checkout session
            await prisma.checkoutSession.update({
                where: { stripeSessionId: session.id },
                data: {
                    paymentStatus: "PAID",
                    updatedAt: new Date(),
                },
            });

            // CREATE ORDER - Pass session directly, not shippingInfo
            const order = await this.createOrderFromSession(session, userId, null, shippingCost, storeCreditUsed, items);

            // Get order items for email
            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: order.id },
                include: { product: true },
            });

            // Update each product's quantity
            for (const item of orderItems) {
                if (!item.productId) continue;

                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });

                if (product) {
                    const sizes = product.sizes as Array<{ mg: number; price: number; quantity: number }>;
                    const sizeIndex = sizes.findIndex((s) => s.mg === item.size);

                    if (sizeIndex !== -1) {
                        sizes[sizeIndex].quantity -= item.quantity;

                        await prisma.product.update({
                            where: { id: item.productId },
                            data: {
                                sizes: sizes as any,
                                inStock: sizes.some((s) => s.quantity > 0),
                            },
                        });

                        console.log(`✅ Decreased ${item.product?.name} ${item.size}mg by ${item.quantity}. New quantity: ${sizes[sizeIndex].quantity}`);
                    }
                }
            }

            // Prepare email data
            const emailData = {
                id: order.id,
                user: {
                    name: user.name,
                },
                shippingInfo: {
                    name: order.name,
                    address: order.address,
                    city: order.city,
                    state: order.state,
                    zip: order.zip,
                    country: order.country,
                },
                pricing: {
                    subtotal: order.subtotal,
                    shipping: order.shipping,
                    creditApplied: order.creditApplied,
                    total: order.total,
                },
                items: orderItems.map((item) => ({
                    name: item.product?.name || "Product",
                    quantity: item.quantity,
                    price: item.unitPrice,
                })),
                createdAt: order.createdAt.toISOString(),
            };

            // Send confirmation email
            sendOrderConfirmationEmail(user.email, emailData).catch((error) => {
                console.error("❌ Email sending failed (non-critical):", error);
            });

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

    private async createOrderFromSession(session: EnhancedStripeSession, userId: string, shippingInfo: any, shippingCost: number, storeCreditUsed: number, itemsFromMetadata: any[] = []) {
        try {
            const sessionDetails = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["line_items.data.price.product", "payment_intent", "shipping_cost", "customer_details"],
            });

            const lineItems = sessionDetails.line_items?.data || [];
            let paymentIntentId: string;

            if (typeof sessionDetails.payment_intent === "string") {
                paymentIntentId = sessionDetails.payment_intent;
            } else if (sessionDetails.payment_intent && typeof sessionDetails.payment_intent === "object") {
                paymentIntentId = sessionDetails.payment_intent.id;
            } else {
                paymentIntentId = `no-pi-${Date.now()}`;
            }

            // Get shipping info directly from session
            const sessionAny = sessionDetails as any;

            // Address is in customer_details, NOT in shipping
            const customerDetails = sessionAny.customer_details;

            // Try to get from payment_intent.shipping as fallback
            const paymentIntentShipping = sessionAny.payment_intent?.shipping;

            // Use customer_details address first, then fallback to payment_intent shipping
            const address = customerDetails?.address || paymentIntentShipping?.address;

            const orderShippingInfo = {
                name: customerDetails?.name || paymentIntentShipping?.name || "",
                email: customerDetails?.email || "",
                phone: customerDetails?.phone || "",
                address: address?.line1 || "",
                city: address?.city || "",
                state: address?.state || "",
                zip: address?.postal_code || "",
                country: address?.country || "US",
            };

            // Add line2 to address if exists
            if (address?.line2) {
                orderShippingInfo.address += ` ${address.line2}`;
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    paymentIntentId: paymentIntentId,
                    userId,
                    name: orderShippingInfo.name,
                    email: orderShippingInfo.email,
                    phone: orderShippingInfo.phone,
                    address: orderShippingInfo.address,
                    city: orderShippingInfo.city,
                    state: orderShippingInfo.state,
                    zip: orderShippingInfo.zip,
                    country: orderShippingInfo.country,
                    originalPrice: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    discountAmount: 0,
                    discountPercentage: 0,
                    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    shipping: shippingCost,
                    creditApplied: storeCreditUsed,
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: "PAID",
                    commissionAmount: 0,
                    commissionPaid: false,
                },
            });

            // Create order items
            for (let i = 0; i < lineItems.length; i++) {
                const item = lineItems[i];
                const productId = this.extractProductIdFromLineItem(item);

                // Get size from metadata - CONVERT TO NUMBER
                let size: number | null = null;
                if (itemsFromMetadata[i]) {
                    const sizeValue = itemsFromMetadata[i].size;
                    if (sizeValue !== undefined && sizeValue !== null) {
                        size = typeof sizeValue === "string" ? parseInt(sizeValue, 10) : sizeValue;
                    }
                }

                // If not found in metadata, try to extract from description
                if (!size && item.description) {
                    const mgMatch = item.description.match(/(\d+)mg/);
                    if (mgMatch) {
                        size = parseInt(mgMatch[1], 10);
                    }
                }

                // Get unit price
                const discountedPrice = item.amount_total ? item.amount_total / 100 / (item.quantity || 1) : 0;

                if (productId > 0) {
                    await prisma.orderItem.create({
                        data: {
                            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            orderId: order.id,
                            productId,
                            size: size,
                            quantity: item.quantity || 1,
                            unitPrice: discountedPrice,
                            discountedPrice: discountedPrice,
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
            console.log("Store Credit Used:", order.creditApplied);

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

            // Restore store credit if used
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

            // Check if session exists before updating
            const existingSession = await prisma.checkoutSession.findUnique({
                where: { stripeSessionId: session.id },
            });

            if (existingSession) {
                await prisma.checkoutSession.update({
                    where: { stripeSessionId: session.id },
                    data: {
                        paymentStatus: "FAILED",
                        updatedAt: new Date(),
                    },
                });
                console.log(`✅ Checkout session ${session.id} marked as expired`);
            } else {
                console.log(`ℹ️ Checkout session ${session.id} not found in database - likely from test/abandoned cart`);
            }
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

            // Check if session exists
            const existingSession = await prisma.checkoutSession.findUnique({
                where: { stripeSessionId: session.id },
            });

            if (existingSession) {
                await prisma.checkoutSession.update({
                    where: { stripeSessionId: session.id },
                    data: {
                        paymentStatus: "FAILED",
                        updatedAt: new Date(),
                    },
                });

                if (existingSession.orderId) {
                    await prisma.order.update({
                        where: { id: existingSession.orderId },
                        data: { status: "FAILED" },
                    });
                }
            } else {
                console.log(`ℹ️ Checkout session ${session.id} not found in database - likely from test/abandoned cart`);
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
                include: {
                    user: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
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

            const emailData = {
                id: order.id,
                user: {
                    name: order.user?.name || order.name,
                },
                items: order.items.map((item) => ({
                    name: item.product?.name || "Product",
                    quantity: item.quantity,
                })),
                total: amount || order.total,
            };

            // Get email from user or order
            const email = order.user?.email || order.email;

            if (email) {
                sendOrderRefundedEmail(email, emailData).catch((error) => {
                    console.error("❌ Refund email failed:", error);
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
