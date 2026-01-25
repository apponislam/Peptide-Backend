import { Request, Response } from "express";
import { stripeService } from "./payment.service";

export class PaymentController {
    // Create checkout session
    static async createCheckoutSession(req: Request, res: Response) {
        try {
            const { userId, items, shippingInfo, metadata } = req.body;

            if (!userId || !items || !shippingInfo) {
                return res.status(400).json({
                    success: false,
                    error: "Missing required fields: userId, items, shippingInfo",
                });
            }

            const result = await stripeService.createCheckoutSession(userId, items, shippingInfo, metadata);

            res.json({
                success: true,
                sessionId: result.sessionId,
                url: result.url,
                orderSummary: result.orderSummary,
            });
        } catch (error: any) {
            console.error("Checkout error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create checkout session",
            });
        }
    }

    // Create payment intent
    static async createPaymentIntent(req: Request, res: Response) {
        try {
            const { amount, metadata } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Valid amount is required",
                });
            }

            const result = await stripeService.createPaymentIntent(amount, metadata);

            res.json({
                success: true,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
            });
        } catch (error: any) {
            console.error("Create payment intent error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create payment intent",
            });
        }
    }

    // Create refund
    static async createRefund(req: Request, res: Response) {
        try {
            const { paymentIntentId, amount } = req.body;

            if (!paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    error: "paymentIntentId is required",
                });
            }

            const refund = await stripeService.createRefund(paymentIntentId, amount);

            res.json({
                success: true,
                refund,
            });
        } catch (error: any) {
            console.error("Refund error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create refund",
            });
        }
    }

    // Get session status
    static async getSessionStatus(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            if (!sessionId || Array.isArray(sessionId)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid session ID",
                });
            }

            const session = await stripeService.getSessionStatus(sessionId);

            res.json({
                success: true,
                session,
            });
        } catch (error: any) {
            console.error("Get session error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get session details",
            });
        }
    }
}
