// import { Request, Response } from "express";
// import { shipStationService } from "./shipstation.service";

// export class ShipStationController {
//     // Create ShipStation order
//     static async createOrder(req: Request, res: Response) {
//         try {
//             const { orderId } = req.params;

//             const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

//             if (!orderIdStr) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "orderId is required",
//                 });
//             }

//             const result = await shipStationService.createOrder(orderIdStr);

//             res.json({
//                 success: true,
//                 data: result,
//             });
//         } catch (error: any) {
//             console.error("Create ShipStation order error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to create ShipStation order",
//             });
//         }
//     }

//     // Get shipping rates
//     static async getShippingRates(req: Request, res: Response) {
//         try {
//             const { orderId } = req.params;

//             const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

//             if (!orderIdStr) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "orderId is required",
//                 });
//             }

//             const rates = await shipStationService.getShippingRates(orderIdStr);

//             res.json({
//                 success: true,
//                 rates,
//             });
//         } catch (error: any) {
//             console.error("Get shipping rates error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to get shipping rates",
//             });
//         }
//     }

//     // Create shipping label
//     static async createLabel(req: Request, res: Response) {
//         try {
//             const { orderId } = req.params;

//             const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

//             if (!orderIdStr) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "orderId is required",
//                 });
//             }

//             const label = await shipStationService.createLabel(orderIdStr);

//             res.json({
//                 success: true,
//                 label,
//             });
//         } catch (error: any) {
//             console.error("Create label error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to create shipping label",
//             });
//         }
//     }

//     // List ShipStation orders
//     static async listOrders(req: Request, res: Response) {
//         try {
//             const orders = await shipStationService.listOrders(req.query);

//             res.json({
//                 success: true,
//                 orders,
//             });
//         } catch (error: any) {
//             console.error("List orders error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to list orders",
//             });
//         }
//     }

//     // Update order tracking
//     static async updateTracking(req: Request, res: Response) {
//         try {
//             const { orderId } = req.params;
//             const { trackingNumber, carrier } = req.body;

//             const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

//             if (!orderIdStr) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "orderId is required",
//                 });
//             }

//             const result = await shipStationService.updateTracking(orderIdStr, trackingNumber, carrier);

//             res.json({
//                 success: true,
//                 data: result,
//             });
//         } catch (error: any) {
//             console.error("Update tracking error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to update tracking",
//             });
//         }
//     }

//     // Mark order as shipped
//     static async markAsShipped(req: Request, res: Response) {
//         try {
//             const { orderId } = req.params;

//             const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

//             if (!orderIdStr) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "orderId is required",
//                 });
//             }

//             const result = await shipStationService.markOrderAsShipped(orderIdStr);

//             res.json({
//                 success: true,
//                 data: result,
//             });
//         } catch (error: any) {
//             console.error("Mark as shipped error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to mark order as shipped",
//             });
//         }
//     }

//     static async getCarriers(req: Request, res: Response) {
//         try {
//             const result = await shipStationService.getCarriers();

//             res.json({
//                 success: true,
//                 data: result,
//             });
//         } catch (error: any) {
//             console.error("Get carriers error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to get carriers",
//             });
//         }
//     }

//     static async getWarehouses(req: Request, res: Response) {
//         try {
//             const result = await shipStationService.getWarehouses();

//             res.json({
//                 success: true,
//                 data: result,
//             });
//         } catch (error: any) {
//             console.error("Get carriers error:", error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message || "Failed to get carriers",
//             });
//         }
//     }
// }

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
