import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { orderServices } from "./orders.services";
import { OrderStatus } from "../../../generated/prisma/enums";
import ApiError from "../../../errors/ApiError";
import sendResponse from "../../../utils/sendResponse.";

// Get single order by ID - USER'S OWN ORDER ONLY
const getOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const userId = req.user?.id;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const order = await orderServices.getOrderById(orderId, userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order retrieved successfully",
        data: order,
    });
});

// Get orders with filters - USER'S OWN ORDERS ONLY
const getOrders = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const result = await orderServices.getOrders(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as OrderStatus,
        startDate: startDate as string,
        endDate: endDate as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Your orders retrieved successfully",
        data: result.orders,
        meta: result.meta,
    });
});

export const orderControllers = {
    getOrder,
    getOrders,
};
