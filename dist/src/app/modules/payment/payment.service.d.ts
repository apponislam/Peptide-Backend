import Stripe from "stripe";
import { CheckoutItem, EnhancedStripeSession, OrderSummary, ShippingInfo } from "./payment.types";
export declare class StripeService {
    private calculateOrderSummary;
    createCheckoutSession(userId: string, items: CheckoutItem[], shippingInfo: ShippingInfo, metadata?: Record<string, any>): Promise<{
        sessionId: string;
        url: string | null;
        checkoutSession: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            orderId: string | null;
            stripeSessionId: string;
            paymentStatus: import("../../../generated/prisma/enums").StripePaymentStatus;
        };
        orderSummary: OrderSummary;
    }>;
    processWebhookEvent(event: Stripe.Event): Promise<void>;
    handleCheckoutSessionCompleted(session: EnhancedStripeSession): Promise<void>;
    private createOrderFromSession;
    private extractProductIdFromLineItem;
    private processCommissions;
    private updateUserStoreCredit;
    private handleCheckoutSessionExpired;
    private handleAsyncPaymentSucceeded;
    private handleAsyncPaymentFailed;
    createPaymentIntent(amount: number, metadata?: Record<string, any>): Promise<{
        clientSecret: string | null;
        paymentIntentId: string;
    }>;
    createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Response<Stripe.Refund>>;
    getSessionStatus(sessionId: string): Promise<any>;
}
export declare const stripeService: StripeService;
//# sourceMappingURL=payment.service.d.ts.map