import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { adminServices } from "./admin.services";
import sendResponse from "../../../utils/sendResponse.";
import { OrderStatus, UserRole, UserTier } from "../../../generated/prisma/enums";
import ApiError from "../../../errors/ApiError";

// Get dashboard stats
const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await adminServices.getDashboardStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
    });
});

// Get all orders
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "", status, userId, sortBy = "createdAt", sortOrder = "desc", startDate, endDate, minAmount, maxAmount } = req.query;

    const result = await adminServices.getAllOrders({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        status: status as OrderStatus,
        userId: userId as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        startDate: startDate as string,
        endDate: endDate as string,
        ...(minAmount && { minAmount: Number(minAmount) }),
        ...(maxAmount && { maxAmount: Number(maxAmount) }),
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        data: result.orders,
        meta: result.meta,
    });
});

const getOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const order = await adminServices.getOrderById(orderId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order retrieved successfully",
        data: order,
    });
});

// Update order status
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || typeof id !== "string") {
        throw new ApiError(400, "Invalid order ID");
    }

    const order = await adminServices.updateOrderStatus(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order status updated successfully",
        data: order,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "", role, tier, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const result = await adminServices.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        role: role as UserRole,
        tier: tier as UserTier,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta,
    });
});

// Update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const user = await adminServices.updateUser(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User updated successfully",
        data: user,
    });
});

// Get top selling products
const getTopSellingProducts = catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;

    const products = await adminServices.getTopSellingProducts(limit);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Top selling products retrieved successfully",
        data: products,
    });
});

// Get referral performance
const getReferralPerformance = catchAsync(async (req: Request, res: Response) => {
    const performance = await adminServices.getReferralPerformance();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral performance retrieved successfully",
        data: performance,
    });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "User ID is required",
            data: null,
        });
    }

    const result = await adminServices.getUserById(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

export const adminControllers = {
    getDashboardStats,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getAllUsers,
    updateUser,
    getTopSellingProducts,
    getReferralPerformance,
    getUserById,
};
