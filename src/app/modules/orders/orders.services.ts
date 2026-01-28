import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
import { OrderStatus, Prisma } from "../../../generated/prisma/client";

// Get order by ID - USER CAN ONLY SEE THEIR OWN
const getOrderById = async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
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
        throw new ApiError(404, "Order not found");
    }

    // USER CAN ONLY SEE THEIR OWN ORDER
    if (order.userId !== userId) {
        throw new ApiError(403, "You are not authorized to view this order");
    }

    return order;
};

// Get orders with filters - USER CAN ONLY SEE THEIR OWN ORDERS
const getOrders = async (userId: string, params: { page?: number; limit?: number; status?: OrderStatus; startDate?: string; endDate?: string; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
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
    const orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
    if (params.sortBy) {
        const allowedSortFields = ["createdAt", "total", "status"];
        if (allowedSortFields.includes(params.sortBy)) {
            const sortField = params.sortBy as keyof Prisma.OrderOrderByWithRelationInput;
            orderBy[sortField] = params.sortOrder || "desc";
        }
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
        prisma.order.count({ where }),
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

export const orderServices = {
    getOrderById,
    getOrders,
};
