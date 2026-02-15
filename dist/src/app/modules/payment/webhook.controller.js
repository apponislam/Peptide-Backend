"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const payment_service_1 = require("./payment.service");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
});
class WebhookController {
    // Handle Stripe webhook
    static async handleStripeWebhook(req, res) {
        const signature = req.headers["stripe-signature"];
        try {
            // Construct the event from Stripe
            const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
            // Process the event in the stripe service
            await payment_service_1.stripeService.processWebhookEvent(event);
            res.json({ received: true });
        }
        catch (error) {
            console.error("Webhook error:", error);
            res.status(400).json({
                error: "Webhook handler failed",
                message: error.message,
            });
        }
    }
}
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhook.controller.js.map