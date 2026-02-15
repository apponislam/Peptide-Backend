"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
// Regular payment routes
router.post("/checkout", payment_controller_1.PaymentController.createCheckoutSession);
router.post("/create-payment-intent", payment_controller_1.PaymentController.createPaymentIntent);
router.post("/refund", payment_controller_1.PaymentController.createRefund);
router.get("/session/:sessionId", payment_controller_1.PaymentController.getSessionStatus);
exports.paymentRoutes = router;
//# sourceMappingURL=payment.routes.js.map