export declare const adminServices: {
    adminLogin: (data: {
        email: string;
        password: string;
    }) => Promise<{
        token: string;
        admin: boolean;
    }>;
    getDashboardStats: () => Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        totalProducts: number;
    }>;
    getAllOrders: () => Promise<({
        user: {
            email: string;
            referralCode: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        items: import("@prisma/client/runtime/client").JsonValue;
        originalSubtotal: number;
        subtotal: number;
        discount: number;
        shipping: number;
        storeCreditsApplied: number;
        total: number;
        shippingName: string;
        shippingAddress: string;
        stripeSessionId: string | null;
        stripePaymentIntentId: string | null;
        status: string;
    })[]>;
    updateOrderStatus: (id: number, data: {
        status: string;
    }) => Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        items: import("@prisma/client/runtime/client").JsonValue;
        originalSubtotal: number;
        subtotal: number;
        discount: number;
        shipping: number;
        storeCreditsApplied: number;
        total: number;
        shippingName: string;
        shippingAddress: string;
        stripeSessionId: string | null;
        stripePaymentIntentId: string | null;
        status: string;
    }>;
    getAllUsers: () => Promise<{
        id: string;
        email: string;
        referralCode: string;
        name: string;
        tier: string;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        createdAt: Date;
    }[]>;
    updateUser: (id: string, data: {
        storeCredit?: number;
        tier?: string;
        referralCount?: number;
    }) => Promise<{
        id: string;
        email: string;
        referralCode: string;
        name: string;
        password: string;
        tier: string;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        referrerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=admin.services.d.ts.map