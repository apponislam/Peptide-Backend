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
            tier: string;
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
            tier: string;
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
        tier: string;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        createdAt: Date;
        orders: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
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
        }[];
    }>;
    refreshToken: (refreshToken: string) => Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            referralCode: string;
            name: string;
            tier: string;
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
        tier: string;
        role: import("../../../generated/prisma/enums").UserRole;
        storeCredit: number;
        referralCount: number;
        createdAt: Date;
    }>;
    checkReferralCodeAvailability: (code: string) => Promise<boolean>;
};
//# sourceMappingURL=auth.services.d.ts.map