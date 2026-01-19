import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { authServices } from "./auth.services";
import sendResponse from "../../../utils/sendResponse.";

const register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, referralCode } = req.body;
    console.log(req.body);
    console.log(referralCode);

    const result = await authServices.register(name, email, password, referralCode);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authServices.login(email, password);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || (req.user as any)?.userId;

    const user = await authServices.getCurrentUser(userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
});

const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return sendResponse(res, {
            statusCode: 401,
            success: false,
            message: "Refresh token not found",
            data: null,
        });
    }

    const result = await authServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Access token refreshed successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    const result = await authServices.logout();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
});

// NEW: Update referral code
const updateReferralCode = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || (req.user as any)?.userId;
    const { newCode } = req.body;

    const updatedUser = await authServices.updateReferralCode(userId, newCode);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral code updated successfully",
        data: updatedUser,
    });
});

// NEW: Check if referral code is available
const checkReferralCode = catchAsync(async (req: Request, res: Response) => {
    const code = req.params.code as string;

    const isAvailable = await authServices.checkReferralCodeAvailability(code);

    // Clean the code to check length
    const cleanedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

    let message = "";
    if (cleanedCode.length < 4) {
        message = "Code must be at least 4 characters";
    } else if (isAvailable) {
        message = "Code is available";
    } else {
        message = "Code is already taken";
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: message,
        data: {
            available: cleanedCode.length >= 4 ? isAvailable : false,
            validLength: cleanedCode.length >= 4,
        },
    });
});

// Admin

const adminLogin = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authServices.adminLogin(email, password);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

export const authControllers = {
    register,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout,
    updateReferralCode,
    checkReferralCode,
    adminLogin,
};
