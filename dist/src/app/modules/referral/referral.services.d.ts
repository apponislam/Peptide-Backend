export declare const referralServices: {
    getReferralStats: (userId: string) => Promise<{
        referralCode: string;
        tier: string;
        referralCount: number;
        storeCredit: number;
        referrals: {
            id: string;
            email: string;
            tier: string;
            createdAt: Date;
        }[];
        totalCommission: number;
        commissions: {
            id: number;
            referrerId: string;
            createdAt: Date;
            buyerId: string;
            orderId: number;
            amount: number;
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