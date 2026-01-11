import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { adminServices } from "./admin.services";
import sendResponse from "../../../utils/sendResponse.";

// Admin login
const adminLogin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminServices.adminLogin(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin login successful",
        data: result,
    });
});

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
    const orders = await adminServices.getAllOrders();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
    });
});

// Update order status
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Invalid order ID",
            data: null,
        });
    }

    const order = await adminServices.updateOrderStatus(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order status updated successfully",
        data: order,
    });
});

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await adminServices.getAllUsers();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        data: users,
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

export const adminControllers = {
    adminLogin,
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUser,
};
