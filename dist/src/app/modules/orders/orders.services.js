"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderServices = void 0;
const prisma_1 = require("../../../lib/prisma");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
// Get order by ID - USER CAN ONLY SEE THEIR OWN
const getOrderById = async (orderId, userId) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tier: true,
                },
            },
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            commissions: {
                include: {
                    referrer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            checkoutSessions: {
                select: {
                    id: true,
                    stripeSessionId: true,
                    paymentStatus: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!order) {
        throw new ApiError_1.default(404, "Order not found");
    }
    // USER CAN ONLY SEE THEIR OWN ORDER
    if (order.userId !== userId) {
        throw new ApiError_1.default(403, "You are not authorized to view this order");
    }
    return order;
};
// Get orders with filters - USER CAN ONLY SEE THEIR OWN ORDERS
const getOrders = async (userId, params) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = {
        userId: userId, // ALWAYS filter by logged-in user
    };
    // Status filter
    if (params.status) {
        where.status = params.status;
    }
    // Date range filter
    if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) {
            where.createdAt.gte = new Date(params.startDate);
        }
        if (params.endDate) {
            where.createdAt.lte = new Date(params.endDate);
        }
    }
    // Sorting
    const orderBy = { createdAt: "desc" };
    if (params.sortBy) {
        const allowedSortFields = ["createdAt", "total", "status"];
        if (allowedSortFields.includes(params.sortBy)) {
            const sortField = params.sortBy;
            orderBy[sortField] = params.sortOrder || "desc";
        }
    }
    // Get orders with pagination
    const [orders, total] = await Promise.all([
        prisma_1.prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma_1.prisma.order.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        orders,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
exports.orderServices = {
    getOrderById,
    getOrders,
};
//# sourceMappingURL=orders.services.js.map