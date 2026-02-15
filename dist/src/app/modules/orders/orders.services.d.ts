import { OrderStatus } from "../../../generated/prisma/client";
export declare const orderServices: {
    getOrderById: (orderId: string, userId: string) => Promise<{
        checkoutSessions: {
            id: string;
            createdAt: Date;
            stripeSessionId: string;
            paymentStatus: import("../../../generated/prisma/enums").StripePaymentStatus;
        }[];
        user: {
            id: string;
            email: string;
            name: string;
            tier: import("../../../generated/prisma/enums").UserTier;
        };
        items: ({
            product: {
                id: number;
                name: string;
            } | null;
        } & {
            id: string;
            orderId: string;
            productId: number | null;
            quantity: number;
            unitPrice: number;
            discountedPrice: number;
        })[];
        commissions: ({
            referrer: {
                id: string;
                email: string;
                name: string;
            };
            buyer: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            referrerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma/enums").CommissionStatus;
            orderId: string;
            buyerId: string;
            amount: number;
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentIntentId: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        originalPrice: number;
        discountPercentage: number;
        discountAmount: number;
        subtotal: number;
        shipping: number;
        creditApplied: number;
        total: number;
        status: OrderStatus;
        shipstationOrderId: number | null;
        trackingNumber: string | null;
        labelUrl: string | null;
        commissionAmount: number | null;
        commissionPaid: boolean;
    }>;
    getOrders: (userId: string, params: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => Promise<{
        orders: ({
            items: ({
                product: {
                    id: number;
                    name: string;
                } | null;
            } & {
                id: string;
                orderId: string;
                productId: number | null;
                quantity: number;
                unitPrice: number;
                discountedPrice: number;
            })[];
        } & {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            paymentIntentId: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            originalPrice: number;
            discountPercentage: number;
            discountAmount: number;
            subtotal: number;
            shipping: number;
            creditApplied: number;
            total: number;
            status: OrderStatus;
            shipstationOrderId: number | null;
            trackingNumber: string | null;
            labelUrl: string | null;
            commissionAmount: number | null;
            commissionPaid: boolean;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
};
//# sourceMappingURL=orders.services.d.ts.map