export declare function createAdmin(): Promise<{
    id: string;
    email: string;
    referralCode: string;
    name: string;
    password: string;
    tier: import("../../generated/prisma/enums").UserTier;
    role: import("../../generated/prisma/enums").UserRole;
    isActive: boolean;
    deletedAt: Date | null;
    storeCredit: number;
    referralCount: number;
    isReferralValid: boolean;
    referrerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=seed.d.ts.map