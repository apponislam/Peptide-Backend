import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import { jwtHelper } from "../../../utils/jwtHelpers";
import ApiError from "../../../errors/ApiError";
const register = async (name, email, password, referralCode) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new ApiError(400, "Email already registered");
    }
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    // Find referrer if code provided
    let referrerId = null;
    if (referralCode && referralCode !== "JAKE") {
        const referrer = await prisma.user.findUnique({
            where: { referralCode },
        });
        if (!referrer) {
            throw new ApiError(400, "Invalid referral code");
        }
        referrerId = referrer.id;
    }
    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referrerId,
            role: "USER",
            tier: "Member",
            storeCredit: 0,
            referralCount: 0,
        },
    });
    // Prepare user data without password
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        tier: user.tier,
        storeCredit: user.storeCredit,
        referralCount: user.referralCount,
        createdAt: user.createdAt,
    };
    // Generate JWT tokens with full user data
    const accessToken = jwtHelper.generateToken(userData, config.jwt_access_secret, config.jwt_access_expire || "1h");
    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret, config.jwt_refresh_expire || "7d");
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError(401, "Invalid credentials");
    }
    // Prepare user data without password
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        tier: user.tier,
        storeCredit: user.storeCredit,
        referralCount: user.referralCount,
        createdAt: user.createdAt,
    };
    // Generate JWT tokens with full user data
    const accessToken = jwtHelper.generateToken(userData, config.jwt_access_secret, config.jwt_access_expire || "30d");
    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret, config.jwt_refresh_expire || "365d");
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            referralCode: true,
            tier: true,
            storeCredit: true,
            referralCount: true,
            createdAt: true,
            orders: {
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    items: true,
                    originalSubtotal: true,
                    subtotal: true,
                    discount: true,
                    shipping: true,
                    storeCreditsApplied: true,
                    total: true,
                    shippingName: true,
                    shippingAddress: true,
                    stripeSessionId: true,
                    stripePaymentIntentId: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
};
const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }
    // Verify refresh token
    let decoded;
    try {
        decoded = jwtHelper.verifyToken(refreshToken, config.jwt_refresh_secret);
    }
    catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
    // Get full user data
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            referralCode: true,
            tier: true,
            storeCredit: true,
            referralCount: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Generate new access token with full user data
    const newAccessToken = jwtHelper.generateToken(user, config.jwt_access_secret, config.jwt_access_expire || "1h");
    return {
        accessToken: newAccessToken,
        user,
    };
};
const logout = async (refreshToken) => {
    return { message: "Logged out successfully" };
};
// Update user's referral code
const updateReferralCode = async (userId, newCode) => {
    if (!newCode || newCode.trim().length < 4) {
        throw new ApiError(400, "Referral code must be at least 4 characters");
    }
    const cleanedCode = newCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanedCode.length < 4 || cleanedCode.length > 20) {
        throw new ApiError(400, "Referral code must be 4-20 characters");
    }
    const existingUser = await prisma.user.findUnique({
        where: { referralCode: cleanedCode },
    });
    if (existingUser) {
        throw new ApiError(400, "This referral code is already taken");
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: cleanedCode },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            referralCode: true,
            tier: true,
            storeCredit: true,
            referralCount: true,
            createdAt: true,
        },
    });
    return updatedUser;
};
const checkReferralCodeAvailability = async (code) => {
    if (!code || code.trim().length < 1) {
        return false;
    }
    const cleanedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Return false if code is less than 4 characters
    if (cleanedCode.length < 4) {
        return false;
    }
    const existingUser = await prisma.user.findUnique({
        where: { referralCode: cleanedCode },
    });
    return !existingUser;
};
export const authServices = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
    updateReferralCode,
    checkReferralCodeAvailability,
};
//# sourceMappingURL=auth.services.js.map