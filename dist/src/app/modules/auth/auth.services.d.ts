export declare const authServices: {
    register: (name: string, email: string, password: string, referralCode?: string) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../../generated/prisma/enums").UserRole;
            referralCode: string;
            tier: import("../../../generated/prisma/enums").UserTier;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
        };
    }>;
    login: (email: string, password: string) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../../../generated/prisma/enums").UserRole;
            referralCode: string;
            tier: import("../../../generated/prisma/enums").UserTier;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
        };
    }>;
    getCurrentUser: (userId: string) => Promise<{
        id: string;
        email: string;
        referralCode: string;
        name: string;
        tier: import("../../../generated/prisma/enums").UserTier;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        createdAt: Date;
        orders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            originalPrice: number;
            discountPercentage: number;
            discountAmount: number;
            subtotal: number;
            shipping: number;
            creditApplied: number;
            total: number;
            status: import("../../../generated/prisma/enums").OrderStatus;
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
        }[];
    }>;
    refreshToken: (refreshToken: string) => Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            referralCode: string;
            name: string;
            tier: import("../../../generated/prisma/enums").UserTier;
            role: import("../../../generated/prisma/enums").UserRole;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
        };
    }>;
    logout: (refreshToken?: string) => Promise<{
        message: string;
    }>;
    updateReferralCode: (userId: string, newCode: string) => Promise<{
        id: string;
        email: string;
        referralCode: string;
        name: string;
        tier: import("../../../generated/prisma/enums").UserTier;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        createdAt: Date;
    }>;
    checkReferralCodeAvailability: (code: string) => Promise<boolean>;
    adminLogin: (email: string, password: string) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: "ADMIN";
            referralCode: string;
            tier: import("../../../generated/prisma/enums").UserTier;
            storeCredit: number;
            referralCount: number;
            createdAt: Date;
        };
    }>;
};
//# sourceMappingURL=auth.services.d.ts.map