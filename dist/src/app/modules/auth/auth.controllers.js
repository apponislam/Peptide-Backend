"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const auth_services_1 = require("./auth.services");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
const register = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, password, referralCode } = req.body;
    const result = await auth_services_1.authServices.register(name, email, password, referralCode);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await auth_services_1.authServices.login(email, password);
    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const getCurrentUser = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?.userId;
    const user = await auth_services_1.authServices.getCurrentUser(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
});
const refreshAccessToken = (0, catchAsync_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "Refresh token not found",
            data: null,
        });
    }
    const result = await auth_services_1.authServices.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Access token refreshed successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
const logout = (0, catchAsync_1.default)(async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    const result = await auth_services_1.authServices.logout();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
});
// NEW: Update referral code
const updateReferralCode = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?.userId;
    const { newCode } = req.body;
    const updatedUser = await auth_services_1.authServices.updateReferralCode(userId, newCode);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Referral code updated successfully",
        data: updatedUser,
    });
});
// NEW: Check if referral code is available
const checkReferralCode = (0, catchAsync_1.default)(async (req, res) => {
    const code = req.params.code;
    const isAvailable = await auth_services_1.authServices.checkReferralCodeAvailability(code);
    // Clean the code to check length
    const cleanedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let message = "";
    if (cleanedCode.length < 4) {
        message = "Code must be at least 4 characters";
    }
    else if (isAvailable) {
        message = "Code is available";
    }
    else {
        message = "Code is already taken";
    }
    (0, sendResponse_1.default)(res, {
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
const adminLogin = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await auth_services_1.authServices.adminLogin(email, password);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Admin login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});
exports.authControllers = {
    register,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout,
    updateReferralCode,
    checkReferralCode,
    adminLogin,
};
//# sourceMappingURL=auth.controllers.js.map