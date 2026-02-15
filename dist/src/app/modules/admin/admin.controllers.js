"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const admin_services_1 = require("./admin.services");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
// Get dashboard stats
const getDashboardStats = (0, catchAsync_1.default)(async (req, res) => {
    const stats = await admin_services_1.adminServices.getDashboardStats();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
    });
});
// Get all orders
const getAllOrders = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 10, search = "", status, userId, sortBy = "createdAt", sortOrder = "desc", startDate, endDate, minAmount, maxAmount } = req.query;
    const result = await admin_services_1.adminServices.getAllOrders({
        page: Number(page),
        limit: Number(limit),
        search: search,
        status: status,
        userId: userId,
        sortBy: sortBy,
        sortOrder: sortOrder,
        startDate: startDate,
        endDate: endDate,
        ...(minAmount && { minAmount: Number(minAmount) }),
        ...(maxAmount && { maxAmount: Number(maxAmount) }),
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        data: result.orders,
        meta: result.meta,
    });
});
const getOrder = (0, catchAsync_1.default)(async (req, res) => {
    const orderId = req.params.id;
    if (!orderId) {
        throw new ApiError_1.default(400, "Order ID is required");
    }
    const order = await admin_services_1.adminServices.getOrderById(orderId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order retrieved successfully",
        data: order,
    });
});
// Update order status
const updateOrderStatus = (0, catchAsync_1.default)(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
        throw new ApiError_1.default(400, "Invalid order ID");
    }
    const order = await admin_services_1.adminServices.updateOrderStatus(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Order status updated successfully",
        data: order,
    });
});
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 10, search = "", role, tier, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const result = await admin_services_1.adminServices.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search: search,
        role: role,
        tier: tier,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: result.meta,
    });
});
// Update user
const updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    const user = await admin_services_1.adminServices.updateUser(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User updated successfully",
        data: user,
    });
});
// Get top selling products
const getTopSellingProducts = (0, catchAsync_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const products = await admin_services_1.adminServices.getTopSellingProducts(limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Top selling products retrieved successfully",
        data: products,
    });
});
// Get referral performance
const getReferralPerformance = (0, catchAsync_1.default)(async (req, res) => {
    const performance = await admin_services_1.adminServices.getReferralPerformance();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Referral performance retrieved successfully",
        data: performance,
    });
});
const getUserById = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "User ID is required",
            data: null,
        });
    }
    const result = await admin_services_1.adminServices.getUserById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});
exports.adminControllers = {
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
//# sourceMappingURL=admin.controllers.js.map