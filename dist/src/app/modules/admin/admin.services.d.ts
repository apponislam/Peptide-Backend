import { UserRole, UserTier } from "../../../generated/prisma/client";
declare const _default: {
    getAllUsers: (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: UserRole;
        tier?: UserTier;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => Promise<{
        users: {
            id: string;
            email: string;
            referralCode: string;
            name: string;
            tier: UserTier;
            role: UserRole;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
            orders: {
                id: string;
                createdAt: Date;
                total: number;
                status: import("../../../generated/prisma/enums").OrderStatus;
            }[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
};
export default _default;
export declare const adminServices: {
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
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
        status: import("../../../generated/prisma/enums").OrderStatus;
        shipstationOrderId: number | null;
        trackingNumber: string | null;
        labelUrl: string | null;
        commissionAmount: number | null;
        commissionPaid: boolean;
    })[]>;
    getAllUsers: (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: UserRole;
        tier?: UserTier;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => Promise<{
        users: {
            id: string;
            email: string;
            referralCode: string;
            name: string;
            tier: UserTier;
            role: UserRole;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
            orders: {
                id: string;
                createdAt: Date;
                total: number;
                status: import("../../../generated/prisma/enums").OrderStatus;
            }[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
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
        tier: UserTier;
        role: UserRole;
        isActive: boolean;
        deletedAt: Date | null;
        storeCredit: number;
        referralCount: number;
        isReferralValid: boolean;
        referrerId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=admin.services.d.ts.map