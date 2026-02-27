import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../../config";
import { jwtHelper } from "../../../utils/jwtHelpers";
import ApiError from "../../../errors/ApiError";
import { sendPasswordResetEmail } from "../../../utils/templates/resetPassTemplate";
import crypto from "crypto";

const register = async (name: string, email: string, password: string, referralCode?: string) => {
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
        throw new ApiError(400, "Email already registered");
    }
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    let referrerId = null;
    console.log(referralCode);
    if (referralCode) {
        const referrer = await prisma.user.findUnique({
            where: { referralCode },
        });
        console.log(referrer);
        if (!referrer) {
            throw new ApiError(400, "Invalid referral code");
        }
        referrerId = referrer.id;
    }

    const user = await prisma.user.create({
        data: {
            name,
            email: normalizedEmail,
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
    };

    const accessToken = jwtHelper.generateToken(userData, config.jwt_access_secret!, config.jwt_access_expire || "1h");

    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret!, config.jwt_refresh_expire || "7d");

    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};

const login = async (email: string, password: string) => {
    // console.log(email, password);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }
    // console.log(user);

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError(401, "Invalid email or password");
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

    const accessToken = jwtHelper.generateToken(userData, config.jwt_access_secret!, config.jwt_access_expire! || "30d");

    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret!, config.jwt_refresh_expire! || "365d");

    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};

const getCurrentUser = async (userId: string) => {
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
        throw new ApiError(404, "User not found");
    }

    return user;
};

const refreshToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = jwtHelper.verifyToken(refreshToken, config.jwt_refresh_secret!);
    } catch (error) {
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
    const newAccessToken = jwtHelper.generateToken(user, config.jwt_access_secret!, config.jwt_access_expire || "1h");

    return {
        accessToken: newAccessToken,
        user,
    };
};

const logout = async (refreshToken?: string) => {
    return { message: "Logged out successfully" };
};

// Update user's referral code
const updateReferralCode = async (userId: string, newCode: string) => {
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

const checkReferralCodeAvailability = async (code: string) => {
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

// Admin

const adminLogin = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
        throw new ApiError(403, "Access denied. Admin only.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError(401, "Invalid email or password");
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
    };

    const accessToken = jwtHelper.generateToken(userData, config.jwt_access_secret!, config.jwt_access_expire! || "30d");

    const refreshToken = jwtHelper.generateToken({ userId: user.id }, config.jwt_refresh_secret!, config.jwt_refresh_expire! || "365d");

    return {
        accessToken,
        refreshToken,
        user: userData,
    };
};

// forgot password

const forgotPassword = async (email: string) => {
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!user) throw new ApiError(404, "User not found");

    // Generate OTP inside function
    const generateOTP = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const otp = generateOTP();
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
            resetPasswordOtp: otp,
            resetPasswordOtpExpiry: expiry,
            resetPasswordToken: resetToken,
            resetPasswordTokenExpiry: expiry,
        },
    });

    const directResetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(normalizedEmail, {
        name: user.name,
        otp,
        resetToken,
        directResetLink,
        expiryMinutes: 10,
    });

    return { message: "Password reset OTP sent to your email" };
};

// 2. Verify OTP - Returns only token
const verifyOTP = async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            resetPasswordOtp: true,
            resetPasswordOtpExpiry: true,
            resetPasswordToken: true,
        },
    });

    if (!user) throw new ApiError(404, "User not found");
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
        throw new ApiError(400, "No OTP found. Request a new one");
    }
    if (new Date() > user.resetPasswordOtpExpiry) {
        throw new ApiError(400, "OTP expired. Request a new one");
    }
    if (user.resetPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    // Return ONLY the token
    return {
        token: user.resetPasswordToken,
    };
};

// 3. Reset Password
const resetPassword = async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordTokenExpiry: {
                gt: new Date(),
            },
        },
    });

    if (!user) throw new ApiError(400, "Invalid or expired token");

    const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordOtp: null,
            resetPasswordOtpExpiry: null,
            resetPasswordToken: null,
            resetPasswordTokenExpiry: null,
        },
    });

    return { message: "Password reset successful" };
};

// my reffarrals

const getMyReferrals = async (userId: string, page: number = 1, limit: number = 10) => {
    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await prisma.user.count({
        where: {
            referrerId: userId,
        },
    });

    // Get paginated referrals
    const referrals = await prisma.user.findMany({
        where: {
            referrerId: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            isReferralValid: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });

    // Transform data - status based on isReferralValid
    const formattedReferrals = referrals.map((ref) => ({
        id: ref.id,
        name: ref.name,
        email: ref.email,
        status: ref.isReferralValid ? "Confirmed" : "Pending",
        joinedAt: ref.createdAt,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
        referrals: formattedReferrals,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};

// Update Profile
const updateProfile = async (userId: string, data: { name?: string; email?: string }) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // If email is being updated, check if it's already taken
    if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ApiError(400, "Email already in use");
        }
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name || user.name,
            email: data.email || user.email,
        },
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

// Change Password
const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    // Get user with password
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            password: true,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });

    return { message: "Password changed successfully" };
};

export const authServices = {
    register,
    login,
    getCurrentUser,
    refreshToken,
    logout,
    updateReferralCode,
    checkReferralCodeAvailability,
    adminLogin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getMyReferrals,
    updateProfile,
    changePassword,
};
