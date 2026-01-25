import Stripe from "stripe";

export interface CheckoutItem {
    productId: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    size?: string;
    image?: string;
}

export interface ShippingInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface OrderSummary {
    originalSubtotal: number;
    discount: number;
    shipping: number;
    storeCreditsApplied: number;
    total: number;
}

export type EnhancedStripeSession = Stripe.Checkout.Session & {
    customer_details?: Stripe.Checkout.Session.CustomerDetails | null;
    shipping?: {
        address?: Stripe.Address | null;
        name?: string | null;
    } | null;
    shipping_cost?: {
        amount_total: number;
        amount_tax: number;
        amount_subtotal: number;
        shipping_rate?: string | Stripe.ShippingRate;
    } | null;
};
