import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";

// Calculate tier based on referral count
const getTierData = (referralCount: number) => {
    if (referralCount >= 10) {
        return { name: "Founder", discount: 20, commission: 15, freeShipping: true };
    }
    if (referralCount >= 3) {
        return { name: "VIP", discount: 20, commission: 10, freeShipping: true };
    }
    return { name: "Member", discount: 10, commission: 0, freeShipping: false };
};

// Get referral stats for a user
const getReferralStats = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const referrals = await prisma.user.findMany({
            where: { referrerId: userId },
            select: {
                id: true,
                email: true,
                tier: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const commissions = await prisma.commission.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: "desc" },
        });

        const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

        return {
            referralCode: user.referralCode,
            tier: user.tier,
            referralCount: user.referralCount,
            storeCredit: user.storeCredit,
            referrals,
            totalCommission,
            commissions,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to fetch referral stats");
    }
};

export const referralServices = {
    getReferralStats,
    getTierData, // Export if needed elsewhere
};
