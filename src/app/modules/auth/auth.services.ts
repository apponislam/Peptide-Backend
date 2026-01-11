import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import { jwtHelper } from "../../../utils/jwtHelpers";

const register = async (name: string, email: string, password: string, referralCode?: string) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds!);

    // Find referrer if code provided
    let referrerId = null;
    if (referralCode && referralCode !== "JAKE") {
        const referrer = await prisma.user.findUnique({
            where: { referralCode },
        });
        if (referrer) {
            referrerId = referrer.id;
        }
    }

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referrerId,
            tier: "Member",
            storeCredit: 0,
            referralCount: 0,
        },
    });

    // Generate JWT tokens using jwtHelper
    const accessToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_access_secret!, config.jwt_access_expire || "1h");

    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret!, config.jwt_refresh_expire || "7d");

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            referralCode: user.referralCode,
            tier: user.tier,
            storeCredit: user.storeCredit,
            referralCount: user.referralCount,
        },
    };
};

const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT tokens using jwtHelper
    const accessToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_access_secret!, config.jwt_access_expire || "30d");

    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret!, config.jwt_refresh_expire || "365d");

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            referralCode: user.referralCode,
            tier: user.tier,
            storeCredit: user.storeCredit,
            referralCount: user.referralCount,
        },
    };
};

const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            referralCode: true,
            tier: true,
            storeCredit: true,
            referralCount: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const refreshToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    // Verify refresh token using jwtHelper
    let decoded;
    try {
        decoded = jwtHelper.verifyToken(refreshToken, config.jwt_refresh_secret!);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Generate new access token
    const newAccessToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_access_secret!, config.jwt_access_expire || "1h");

    return {
        accessToken: newAccessToken,
        user: {
            id: user.id,
            email: user.email,
            referralCode: user.referralCode,
            tier: user.tier,
            storeCredit: user.storeCredit,
            referralCount: user.referralCount,
        },
    };
};

const logout = async (refreshToken?: string) => {
    return { message: "Logged out successfully" };
};

export const authServices = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
};
