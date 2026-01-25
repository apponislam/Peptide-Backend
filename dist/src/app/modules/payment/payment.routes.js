import express from "express";
import { PaymentController } from "./payment.controller";
const router = express.Router();
// Regular payment routes
router.post("/checkout", PaymentController.createCheckoutSession);
router.post("/create-payment-intent", PaymentController.createPaymentIntent);
router.post("/refund", PaymentController.createRefund);
router.get("/session/:sessionId", PaymentController.getSessionStatus);
export const paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map