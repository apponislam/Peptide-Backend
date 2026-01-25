// src/routes/payment.routes.ts
import express from "express";
import { PaymentController, ShipStationController } from "./payment.controller";

const router = express.Router();

// Stripe Routes
router.post("/checkout", PaymentController.createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleWebhook);
router.post("/create-payment-intent", PaymentController.createPaymentIntent);
router.post("/refund", PaymentController.createRefund);

// ShipStation Routes
router.post("/shipstation/order/:orderId", ShipStationController.createOrder);
router.get("/shipstation/rates/:orderId", ShipStationController.getShippingRates);
router.post("/shipstation/label/:orderId", ShipStationController.createLabel);
router.get("/shipstation/orders", ShipStationController.listOrders);

router.get("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

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
});

export default router;
