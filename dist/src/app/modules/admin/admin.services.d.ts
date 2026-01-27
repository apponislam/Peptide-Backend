import { OrderStatus, UserRole, UserTier } from "../../../generated/prisma/client";
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
                status: OrderStatus;
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
    getAllOrders: (params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: OrderStatus;
        userId?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
    }) => Promise<{
        orders: ({
            user: {
                email: string;
                referralCode: string;
                name: string;
                tier: UserTier;
            };
            items: ({
                product: {
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
            commissions: {
                referrer: {
                    email: string;
                    name: string;
                };
                status: import("../../../generated/prisma/enums").CommissionStatus;
                amount: number;
            }[];
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
                status: OrderStatus;
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
    getTopSellingProducts: (limit?: number) => Promise<{
        id: number;
        name: string;
        sales: number;
        totalQuantity: number;
    }[]>;
    getReferralPerformance: () => Promise<{
        topReferrer: string;
        referrals: number;
        totalCommissions: number;
    }[]>;
    getUserById: (id: string) => Promise<{
        user: {
            id: string;
            email: string;
            referralCode: string;
            name: string;
            tier: UserTier;
            role: UserRole;
            isActive: boolean;
            storeCredit: number;
            referralCount: number;
            isReferralValid: boolean;
            referrerId: string | null;
            createdAt: Date;
            updatedAt: Date;
            referrer: {
                id: string;
                email: string;
                referralCode: string;
                name: string;
                tier: UserTier;
            } | null;
            referrals: {
                id: string;
                email: string;
                name: string;
                tier: UserTier;
                storeCredit: number;
                isReferralValid: boolean;
                createdAt: Date;
            }[];
            orders: {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
                total: number;
                status: OrderStatus;
                items: {
                    id: string;
                    quantity: number;
                    unitPrice: number;
                    discountedPrice: number;
                    product: {
                        id: number;
                        name: string;
                    } | null;
                }[];
                commissions: {
                    id: string;
                    createdAt: Date;
                    status: import("../../../generated/prisma/enums").CommissionStatus;
                    amount: number;
                }[];
            }[];
            commissionsEarned: {
                id: string;
                createdAt: Date;
                status: import("../../../generated/prisma/enums").CommissionStatus;
                order: {
                    id: string;
                    createdAt: Date;
                    total: number;
                };
                amount: number;
                buyer: {
                    id: string;
                    email: string;
                    name: string;
                };
            }[];
            checkoutSessions: {
                id: string;
                createdAt: Date;
                order: {
                    id: string;
                    total: number;
                } | null;
                stripeSessionId: string;
                paymentStatus: import("../../../generated/prisma/enums").StripePaymentStatus;
            }[];
        };
        stats: {
            totalOrders: number;
            totalSpent: number;
            averageOrderValue: number;
            totalCommissionsEarned: number;
            totalReferrals: number;
            validReferrals: number;
            referralConversionRate: number;
            recentOrdersLast30Days: number;
            storeCredit: number;
            tier: UserTier;
            referralCount: number;
            isReferralValid: boolean;
        };
    }>;
};
//# sourceMappingURL=admin.services.d.ts.map