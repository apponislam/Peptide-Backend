import Stripe from "stripe";
type CartItem = {
    name: string;
    mg: number;
    price: number;
    quantity: number;
};
type CreateSessionParams = {
    items: CartItem[];
    customer_email?: string;
    success_url: string;
    cancel_url: string;
};
export declare const checkoutServices: {
    createCheckoutSession: (params: CreateSessionParams) => Promise<{
        sessionId: string;
        url: string | null;
    }>;
    verifySession: (sessionId: string) => Promise<{
        session: {
            id: string;
            status: Stripe.Checkout.Session.Status | null;
            payment_status: Stripe.Checkout.Session.PaymentStatus;
            customer_email: string | null;
            amount_total: number;
            currency: string | null;
            created: string;
        };
        line_items: {
            description: string | null;
            quantity: number | null;
            amount: number;
        }[];
    }>;
};
export {};
//# sourceMappingURL=checkout.services.d.ts.map