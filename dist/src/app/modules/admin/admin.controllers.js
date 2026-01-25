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
    const orders = await adminServices.getAllOrders();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
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
export const adminControllers = {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    updateUser,
};
//# sourceMappingURL=admin.controllers.js.map