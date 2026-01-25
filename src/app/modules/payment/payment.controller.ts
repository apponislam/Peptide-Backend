// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { stripeService } from "./payment.service";
import { shipStationService } from "../shipstation/shipstation.service";
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

    // Handle Stripe webhook
    static async handleWebhook(req: Request, res: Response) {
        const signature = req.headers["stripe-signature"] as string;

        try {
            await stripeService.handleWebhook(req.body, signature);
            res.json({ received: true });
        } catch (error: any) {
            console.error("Webhook error:", error);
            res.status(400).json({
                error: "Webhook handler failed",
                message: error.message,
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
}

// ShipStation Controller
export class ShipStationController {
    // Create ShipStation order
    static async createOrder(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const result = await shipStationService.createOrder(orderIdStr);

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error("Create ShipStation order error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create ShipStation order",
            });
        }
    }

    // Get shipping rates
    static async getShippingRates(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const rates = await shipStationService.getShippingRates(orderIdStr);

            res.json({
                success: true,
                rates,
            });
        } catch (error: any) {
            console.error("Get shipping rates error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get shipping rates",
            });
        }
    }

    // Create shipping label
    static async createLabel(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const label = await shipStationService.createLabel(orderIdStr);

            res.json({
                success: true,
                label,
            });
        } catch (error: any) {
            console.error("Create label error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create shipping label",
            });
        }
    }

    // List ShipStation orders
    static async listOrders(req: Request, res: Response) {
        try {
            const orders = await shipStationService.listOrders(req.query);

            res.json({
                success: true,
                orders,
            });
        } catch (error: any) {
            console.error("List orders error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to list orders",
            });
        }
    }
}
