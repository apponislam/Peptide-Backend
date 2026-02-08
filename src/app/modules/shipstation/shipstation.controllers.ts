import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { shipStationService } from "./shipstation.service";
import ApiError from "../../../errors/ApiError";
import sendResponse from "../../../utils/sendResponse.";

// Create ShipStation order
const createOrder = catchAsync(async (req: Request, res: Response) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId as string;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const result = await shipStationService.createOrder(orderId);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "ShipStation order created successfully",
        data: result,
    });
});

// Get shipping rates
const getShippingRates = catchAsync(async (req: Request, res: Response) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId as string;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const rates = await shipStationService.getShippingRates(orderId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Shipping rates retrieved successfully",
        data: rates,
    });
});

// Create shipping label
const createLabel = catchAsync(async (req: Request, res: Response) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId as string;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const label = await shipStationService.createLabel(orderId);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Shipping label created successfully",
        data: label,
    });
});

// List ShipStation orders (with pagination)
const listOrders = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await shipStationService.listOrders({
        page: Number(page),
        limit: Number(limit),
        ...filters,
    });

    // Check if result has pagination data
    if (result.orders && result.meta) {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "ShipStation orders retrieved successfully",
            data: result.orders,
            meta: result.meta,
        });
    } else {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "ShipStation orders retrieved successfully",
            data: result,
        });
    }
});

// Update order tracking
const updateTracking = catchAsync(async (req: Request, res: Response) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId as string;
    const { trackingNumber, carrier } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    if (!trackingNumber || !carrier) {
        throw new ApiError(400, "Tracking number and carrier are required");
    }

    const result = await shipStationService.updateTracking(orderId, trackingNumber, carrier);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tracking information updated successfully",
        data: result,
    });
});

// Mark order as shipped
const markAsShipped = catchAsync(async (req: Request, res: Response) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId as string;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const result = await shipStationService.markOrderAsShipped(orderId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order marked as shipped successfully",
        data: result,
    });
});

const getCarriers = catchAsync(async (req: Request, res: Response) => {
    const result = await shipStationService.getCarriers();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Carriers retrieved successfully",
        data: result,
    });
});

const getWarehouses = catchAsync(async (req: Request, res: Response) => {
    const result = await shipStationService.getWarehouses();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Warehouses retrieved successfully",
        data: result,
    });
});

export const shipStationController = {
    createOrder,
    getShippingRates,
    createLabel,
    listOrders,
    updateTracking,
    markAsShipped,
    getCarriers,
    getWarehouses,
};
