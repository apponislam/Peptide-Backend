export declare function createAdmin(): Promise<{
    id: string;
    email: string;
    referralCode: string;
    name: string;
    password: string;
    tier: string;
    role: import("../../generated/prisma/enums").UserRole;
    storeCredit: number;
    referralCount: number;
    referrerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=seed.d.ts.map