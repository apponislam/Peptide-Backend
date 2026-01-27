import catchAsync from "../../../utils/catchAsync";
import { adminServices } from "./admin.services";
import sendResponse from "../../../utils/sendResponse.";
// Get dashboard stats
const getDashboardStats = catchAsync(async (req, res) => {
    const stats = await adminServices.getDashboardStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
    });
});
// Get all orders
const getAllOrders = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search = "", status, userId, sortBy = "createdAt", sortOrder = "desc", startDate, endDate, minAmount, maxAmount } = req.query;
    const result = await adminServices.getAllOrders({
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
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        data: result.orders,
        meta: result.meta,
    });
});
// Update order status
// const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id as string);
//     if (isNaN(id)) {
//         return sendResponse(res, {
//             statusCode: 400,
//             success: false,
//             message: "Invalid order ID",
//             data: null,
//         });
//     }
//     const order = await adminServices.updateOrderStatus(id, req.body);
//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Order status updated successfully",
//         data: order,
//     });
// });
// Get all users
// const getAllUsers = catchAsync(async (req: Request, res: Response) => {
//     const users = await adminServices.getAllUsers();
//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Users retrieved successfully",
//         data: users,
//     });
// });
const getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search = "", role, tier, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const result = await adminServices.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search: search,
        role: role,
        tier: tier,
        sortBy: sortBy,
        sortOrder: sortOrder,
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
const updateUser = catchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await adminServices.updateUser(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User updated successfully",
        data: user,
    });
});
// Get top selling products
const getTopSellingProducts = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const products = await adminServices.getTopSellingProducts(limit);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Top selling products retrieved successfully",
        data: products,
    });
});
// Get referral performance
const getReferralPerformance = catchAsync(async (req, res) => {
    const performance = await adminServices.getReferralPerformance();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral performance retrieved successfully",
        data: performance,
    });
});
const getUserById = catchAsync(async (req, res) => {
    const id = req.params.id;
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
    getAllUsers,
    updateUser,
    getTopSellingProducts,
    getReferralPerformance,
    getUserById,
};
//# sourceMappingURL=admin.controllers.js.map