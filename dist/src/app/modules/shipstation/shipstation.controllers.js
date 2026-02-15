"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipStationController = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const shipstation_service_1 = require("./shipstation.service");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
// Create ShipStation order
const createOrder = (0, catchAsync_1.default)(async (req, res) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const result = await shipstation_service_1.shipStationService.createOrder(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "ShipStation order created successfully",
        data: result,
    });
});
// Get shipping rates
const getShippingRates = (0, catchAsync_1.default)(async (req, res) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const rates = await shipstation_service_1.shipStationService.getShippingRates(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Shipping rates retrieved successfully",
        data: rates,
    });
});
// Create shipping label
const createLabel = (0, catchAsync_1.default)(async (req, res) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const label = await shipstation_service_1.shipStationService.createLabel(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Shipping label created successfully",
        data: label,
    });
});
// List ShipStation orders (with pagination)
const listOrders = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await shipstation_service_1.shipStationService.listOrders({
        page: Number(page),
        limit: Number(limit),
        ...filters,
    });
    // Check if result has pagination data
    if (result.orders && result.meta) {
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "ShipStation orders retrieved successfully",
            data: result.orders,
            meta: result.meta,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "ShipStation orders retrieved successfully",
            data: result,
        });
    }
});
// Update order tracking
const updateTracking = (0, catchAsync_1.default)(async (req, res) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId;
    const { trackingNumber, carrier } = req.body;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    if (!trackingNumber || !carrier) {
        throw new ApiError_1.default(400, "Tracking number and carrier are required");
    }
    const result = await shipstation_service_1.shipStationService.updateTracking(orderId, trackingNumber, carrier);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tracking information updated successfully",
        data: result,
    });
});
// Mark order as shipped
const markAsShipped = (0, catchAsync_1.default)(async (req, res) => {
    // const { orderId } = req.params;
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const result = await shipstation_service_1.shipStationService.markOrderAsShipped(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order marked as shipped successfully",
        data: result,
    });
});
const getCarriers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await shipstation_service_1.shipStationService.getCarriers();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Carriers retrieved successfully",
        data: result,
    });
});
const getWarehouses = (0, catchAsync_1.default)(async (req, res) => {
    const result = await shipstation_service_1.shipStationService.getWarehouses();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Warehouses retrieved successfully",
        data: result,
    });
});
// Mark order as delivered
const markAsDelivered = (0, catchAsync_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const result = await shipstation_service_1.shipStationService.markAsDelivered(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order marked as delivered successfully",
        data: result,
    });
});
// Cancel order
const cancelOrder = (0, catchAsync_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const result = await shipstation_service_1.shipStationService.cancelOrder(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
});
exports.shipStationController = {
    createOrder,
    getShippingRates,
    createLabel,
    listOrders,
    updateTracking,
    markAsShipped,
    getCarriers,
    getWarehouses,
    markAsDelivered,
    cancelOrder,
};
//# sourceMappingURL=shipstation.controllers.js.map