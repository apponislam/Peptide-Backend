"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const orders_services_1 = require("./orders.services");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
// Get single order by ID - USER'S OWN ORDER ONLY
const getOrder = (0, catchAsync_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    const userId = req.user?.id;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    if (!userId) {
        throw new ApiError_1.default(401, "Unauthorized");
    }
    const order = await orders_services_1.orderServices.getOrderById(orderId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order retrieved successfully",
        data: order,
    });
});
// Get orders with filters - USER'S OWN ORDERS ONLY
const getOrders = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    if (!userId) {
        throw new ApiError_1.default(401, "Unauthorized");
    }
    const result = await orders_services_1.orderServices.getOrders(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status,
        startDate: startDate,
        endDate: endDate,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Your orders retrieved successfully",
        data: result.orders,
        meta: result.meta,
    });
});
exports.orderControllers = {
    getOrder,
    getOrders,
};
//# sourceMappingURL=orders.controllers.js.map