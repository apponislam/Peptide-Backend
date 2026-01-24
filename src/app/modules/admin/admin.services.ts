import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
import { Prisma, UserRole, UserTier } from "../../../generated/prisma/client";

// Get dashboard stats
const getDashboardStats = async () => {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
    });
    const totalCustomers = await prisma.user.count({
        where: {
            isActive: true,
        },
    });

    const totalProducts = await prisma.product.count({
        where: {
            isDeleted: false,
        },
    });

    return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalProducts,
    };
};

const getAllOrders = async () => {
    const orders = await prisma.order.findMany({
        include: {
            user: {
                select: { email: true, referralCode: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return orders;
};

// Update order status
const updateOrderStatus = async (id: number, data: { status: string }) => {
    const existingOrder = await prisma.order.findUnique({
        where: { id },
    });

    if (!existingOrder) {
        throw new ApiError(404, "Order not found");
    }

    const order = await prisma.order.update({
        where: { id },
        data: { status: data.status },
    });

    return order;
};

// Get all users
const getAllUsers = async (params: { page?: number; limit?: number; search?: string; role?: UserRole; tier?: UserTier; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
        where.OR = [{ name: { contains: params.search, mode: "insensitive" } }, { email: { contains: params.search, mode: "insensitive" } }, { referralCode: { contains: params.search, mode: "insensitive" } }];
    }

    if (params.role) {
        where.role = params.role;
    }

    if (params.tier) {
        where.tier = params.tier;
    }

    // Declare orderBy with default
    const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

    // Handle sorting with validation
    if (params.sortBy) {
        // Define allowed sort fields
        const allowedSortFields = ["name", "email", "createdAt", "role", "tier", "referralCount", "storeCredit"];

        if (allowedSortFields.includes(params.sortBy)) {
            const sortField = params.sortBy as keyof Prisma.UserOrderByWithRelationInput;
            orderBy[sortField] = params.sortOrder || "desc";
        }
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                referralCode: true,
                tier: true,
                storeCredit: true,
                referralCount: true,
                createdAt: true,
                role: true,
                orders: {
                    select: {
                        id: true,
                        total: true, // CHANGED: totalAmount → total
                        status: true,
                        createdAt: true,
                    },
                },
            },
            where,
            orderBy,
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};

export default {
    getAllUsers,
};

const updateUser = async (
    id: string,
    data: {
        storeCredit?: number;
        tier?: string;
        referralCount?: number;
    },
) => {
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            ...(data.storeCredit !== undefined && { storeCredit: data.storeCredit }),
            ...(data.tier !== undefined && { tier: data.tier as UserTier }),
            ...(data.referralCount !== undefined && { referralCount: data.referralCount }),
        },
    });

    return user;
};

export const adminServices = {
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUser,
};
