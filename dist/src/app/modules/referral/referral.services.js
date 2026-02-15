"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralServices = void 0;
const prisma_1 = require("../../../lib/prisma");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
// Calculate tier based on referral count
const getTierData = (referralCount) => {
    if (referralCount >= 10) {
        return { name: "Founder", discount: 20, commission: 15, freeShipping: true };
    }
    if (referralCount >= 3) {
        return { name: "VIP", discount: 20, commission: 10, freeShipping: true };
    }
    return { name: "Member", discount: 10, commission: 0, freeShipping: false };
};
// Get referral stats for a user
const getReferralStats = async (userId) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.default(404, "User not found");
        }
        const referrals = await prisma_1.prisma.user.findMany({
            where: { referrerId: userId },
            select: {
                id: true,
                email: true,
                tier: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const commissions = await prisma_1.prisma.commission.findMany({
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
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(500, "Failed to fetch referral stats");
    }
};
exports.referralServices = {
    getReferralStats,
    getTierData,
};
//# sourceMappingURL=referral.services.js.map