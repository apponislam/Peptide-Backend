export declare const referralServices: {
    getReferralStats: (userId: string) => Promise<{
        referralCode: string;
        tier: import("../../../generated/prisma/enums").UserTier;
        referralCount: number;
        storeCredit: number;
        referrals: {
            id: string;
            email: string;
            tier: import("../../../generated/prisma/enums").UserTier;
            createdAt: Date;
        }[];
        totalCommission: number;
        commissions: {
            id: string;
            referrerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma/enums").CommissionStatus;
            orderId: string;
            amount: number;
            buyerId: string;
        }[];
    }>;
    getTierData: (referralCount: number) => {
        name: string;
        discount: number;
        commission: number;
        freeShipping: boolean;
    };
};
//# sourceMappingURL=referral.services.d.ts.map