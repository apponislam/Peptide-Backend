import express from "express";
import { PaymentController } from "./payment.controller";
import { WebhookController } from "./webhook.controller";

const router = express.Router();

// Regular payment routes
router.post("/checkout", PaymentController.createCheckoutSession);
router.post("/create-payment-intent", PaymentController.createPaymentIntent);
router.post("/refund", PaymentController.createRefund);
router.get("/session/:sessionId", PaymentController.getSessionStatus);

// Webhook route (must use raw body)
router.post("/webhook", express.raw({ type: "application/json" }), WebhookController.handleStripeWebhook);

export default router;
