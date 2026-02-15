"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../lib/prisma");
const config_1 = __importDefault(require("../../../config"));
const jwtHelpers_1 = require("../../../utils/jwtHelpers");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const register = async (name, email, password, referralCode) => {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new ApiError_1.default(400, "Email already registered");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    let referrerId = null;
    console.log(referralCode);
    if (referralCode) {
        const referrer = await prisma_1.prisma.user.findUnique({
            where: { referralCode },
        });
        console.log(referrer);
        if (!referrer) {
            throw new ApiError_1.default(400, "Invalid referral code");
        }
        referrerId = referrer.id;
    }
    const user = await prisma_1.prisma.user.create({
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
        shippingCredit: user.storeCredit,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(userData, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire || "1h");
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken({ userId: user.id }, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire || "7d");
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
const login = async (email, password) => {
    // console.log(email, password);
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(401, "Invalid email or password");
    }
    // console.log(user);
    const validPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError_1.default(401, "Invalid email or password");
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
        shippingCredit: user.storeCredit,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(userData, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire || "30d");
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken({ userId: user.id }, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire || "365d");
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
const getCurrentUser = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
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
            shippingCredit: true,
            orders: {
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    // ✅ correct pricing fields
                    originalPrice: true,
                    discountPercentage: true,
                    discountAmount: true,
                    subtotal: true,
                    shipping: true,
                    creditApplied: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    // ✅ relation selection
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            unitPrice: true,
                            discountedPrice: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return user;
};
const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError_1.default(400, "Refresh token is required");
    }
    // Verify refresh token
    let decoded;
    try {
        decoded = jwtHelpers_1.jwtHelper.verifyToken(refreshToken, config_1.default.jwt_refresh_secret);
    }
    catch (error) {
        throw new ApiError_1.default(401, "Invalid or expired refresh token");
    }
    // Get full user data
    const user = await prisma_1.prisma.user.findUnique({
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
        throw new ApiError_1.default(404, "User not found");
    }
    // Generate new access token with full user data
    const newAccessToken = jwtHelpers_1.jwtHelper.generateToken(user, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire || "1h");
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
        throw new ApiError_1.default(400, "Referral code must be at least 4 characters");
    }
    const cleanedCode = newCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanedCode.length < 4 || cleanedCode.length > 20) {
        throw new ApiError_1.default(400, "Referral code must be 4-20 characters");
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { referralCode: cleanedCode },
    });
    if (existingUser) {
        throw new ApiError_1.default(400, "This referral code is already taken");
    }
    const updatedUser = await prisma_1.prisma.user.update({
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
            shippingCredit: true,
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
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { referralCode: cleanedCode },
    });
    return !existingUser;
};
// Admin
const adminLogin = async (email, password) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(401, "Invalid email or password");
    }
    // Check if user is admin
    if (user.role !== "ADMIN") {
        throw new ApiError_1.default(403, "Access denied. Admin only.");
    }
    const validPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError_1.default(401, "Invalid email or password");
    }
    // Prepare admin user data
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
        shippingCredit: user.storeCredit,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(userData, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire || "30d");
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken({ userId: user.id }, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire || "365d");
    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};
exports.authServices = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
    updateReferralCode,
    checkReferralCodeAvailability,
    adminLogin,
};
//# sourceMappingURL=auth.services.js.map