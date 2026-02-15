import Stripe from "stripe";
import { CheckoutItem, EnhancedStripeSession, OrderSummary, ShippingInfo } from "./payment.types";
export declare class StripeService {
    private calculateOrderSummary;
    private calculateShippingCost;
    createCheckoutSession(userId: string, items: CheckoutItem[], shippingInfo: ShippingInfo, shippingAmount: number, subtotal: number, storeCreditUsed: number, total: number, metadata?: Record<string, any>): Promise<{
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
            storeCreditUsed: number;
        };
        orderSummary: OrderSummary;
        shippingCost: number;
        storeCreditUsed: number;
    }>;
    processWebhookEvent(event: Stripe.Event): Promise<void>;
    handleCheckoutSessionCompleted(session: EnhancedStripeSession): Promise<void>;
    private createOrderFromSession;
    private extractProductIdFromLineItem;
    private processCommissions;
    private handleCheckoutSessionExpired;
    private handleAsyncPaymentFailed;
    private handleAsyncPaymentSucceeded;
    createPaymentIntent(amount: number, metadata?: Record<string, any>): Promise<{
        clientSecret: string | null;
        paymentIntentId: string;
    }>;
    createRefund(orderId: string, amount?: number): Promise<{
        stripeRefund: Stripe.Response<Stripe.Refund>;
        orderId: string;
        storeCreditRestored: number;
    }>;
    getSessionStatus(sessionId: string): Promise<any>;
}
export declare const stripeService: StripeService;
//# sourceMappingURL=payment.service.d.ts.map