"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
class PaymentController {
    static async createCheckoutSession(req, res) {
        try {
            const { userId, items, shippingInfo, shippingAmount, subtotal, storeCreditUsed, // ADD THIS
            total, metadata, } = req.body;
            if (!userId || !items || !shippingInfo) {
                return res.status(400).json({
                    success: false,
                    error: "Missing required fields: userId, items, shippingInfo",
                });
            }
            const result = await payment_service_1.stripeService.createCheckoutSession(userId, items, shippingInfo, shippingAmount, subtotal, storeCreditUsed || 0, total, metadata);
            res.json({
                success: true,
                sessionId: result.sessionId,
                url: result.url,
                orderSummary: result.orderSummary,
                storeCreditUsed: result.storeCreditUsed,
            });
        }
        catch (error) {
            console.error("Checkout error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create checkout session",
            });
        }
    }
    // Create payment intent
    static async createPaymentIntent(req, res) {
        try {
            const { amount, metadata } = req.body;
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Valid amount is required",
                });
            }
            const result = await payment_service_1.stripeService.createPaymentIntent(amount, metadata);
            res.json({
                success: true,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
            });
        }
        catch (error) {
            console.error("Create payment intent error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create payment intent",
            });
        }
    }
    // Create refund
    static async createRefund(req, res) {
        try {
            const { orderId, amount } = req.body;
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }
            // Call service method with orderId directly
            const result = await payment_service_1.stripeService.createRefund(orderId, amount);
            res.json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            console.error("Refund error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create refund",
            });
        }
    }
    // Get session status
    static async getSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            if (!sessionId || Array.isArray(sessionId)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid session ID",
                });
            }
            const session = await payment_service_1.stripeService.getSessionStatus(sessionId);
            res.json({
                success: true,
                session,
            });
        }
        catch (error) {
            console.error("Get session error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get session details",
            });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map