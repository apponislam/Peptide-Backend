export declare const getOrderConfirmationEmail: (orderData: {
    id: string;
    user: {
        name: string;
    };
    shippingInfo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    pricing: {
        subtotal: number;
        shipping: number;
        creditApplied: number;
        total: number;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    createdAt: string;
}) => string;
export declare const getOrderShippedEmail: (orderData: {
    id: string;
    user: {
        name: string;
    };
    shippingInfo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    items: Array<{
        name: string;
        quantity: number;
    }>;
    trackingNumber: string;
}) => string;
export declare const getOrderCancelledEmail: (orderData: {
    id: string;
    user: {
        name: string;
    };
    items: Array<{
        name: string;
        quantity: number;
    }>;
    total: number;
}) => string;
export declare const getOrderDeliveredEmail: (orderData: {
    id: string;
    user: {
        name: string;
    };
}) => string;
export declare const getOrderRefundedEmail: (orderData: {
    id: string;
    user: {
        name: string;
    };
    items: Array<{
        name: string;
        quantity: number;
    }>;
    total: number;
}) => string;
export declare function sendOrderConfirmationEmail(to: string, orderData: any): Promise<void>;
export declare function sendOrderShippedEmail(to: string, orderData: any): Promise<void>;
export declare function sendOrderCancelledEmail(to: string, orderData: any): Promise<void>;
export declare function sendOrderDeliveredEmail(to: string, orderData: any): Promise<void>;
export declare function sendOrderRefundedEmail(to: string, orderData: any): Promise<void>;
export declare const OrderEmailTemplates: {
    confirmation: (orderData: {
        id: string;
        user: {
            name: string;
        };
        shippingInfo: {
            name: string;
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
        pricing: {
            subtotal: number;
            shipping: number;
            creditApplied: number;
            total: number;
        };
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        createdAt: string;
    }) => string;
    shipped: (orderData: {
        id: string;
        user: {
            name: string;
        };
        shippingInfo: {
            name: string;
            address: string;
            city: string;
            state: string;
            zip: string;
        };
        items: Array<{
            name: string;
            quantity: number;
        }>;
        trackingNumber: string;
    }) => string;
    cancelled: (orderData: {
        id: string;
        user: {
            name: string;
        };
        items: Array<{
            name: string;
            quantity: number;
        }>;
        total: number;
    }) => string;
    delivered: (orderData: {
        id: string;
        user: {
            name: string;
        };
    }) => string;
    refunded: (orderData: {
        id: string;
        user: {
            name: string;
        };
        items: Array<{
            name: string;
            quantity: number;
        }>;
        total: number;
    }) => string;
};
export declare const OrderEmailSenders: {
    confirmation: typeof sendOrderConfirmationEmail;
    shipped: typeof sendOrderShippedEmail;
    cancelled: typeof sendOrderCancelledEmail;
    delivered: typeof sendOrderDeliveredEmail;
    refunded: typeof sendOrderRefundedEmail;
};
//# sourceMappingURL=orderEmailTemplate.d.ts.map