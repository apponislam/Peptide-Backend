import { Request, Response } from "express";
import Stripe from "stripe";
import { stripeService } from "./payment.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-07-30.basil" as any,
});

export class WebhookController {
    // Handle Stripe webhook
    static async handleStripeWebhook(req: Request, res: Response) {
        const signature = req.headers["stripe-signature"] as string;

        try {
            // Construct the event from Stripe
            const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

            // Process the event in the stripe service
            await stripeService.processWebhookEvent(event);

            res.json({ received: true });
        } catch (error: any) {
            console.error("Webhook error:", error);
            res.status(400).json({
                error: "Webhook handler failed",
                message: error.message,
            });
        }
    }
}
