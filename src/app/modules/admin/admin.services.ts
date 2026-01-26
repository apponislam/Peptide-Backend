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
// const updateOrderStatus = async (id: number, data: { status: string }) => {
//     const existingOrder = await prisma.order.findUnique({
//         where: { id },
//     });

//     if (!existingOrder) {
//         throw new ApiError(404, "Order not found");
//     }

//     const order = await prisma.order.update({
//         where: { id },
//         data: { status: data.status },
//     });

//     return order;
// };

// Get all users
const getAllUsers = async (params: { page?: number; limit?: number; search?: string; role?: UserRole; tier?: UserTier; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

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

    const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

    if (params.sortBy) {
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
                        total: true,
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

const getTopSellingProducts = async (limit: number = 5) => {
    // Get product sales from order items of paid orders
    const orderItems = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
            order: {
                status: "PAID",
            },
            productId: {
                not: null,
            },
        },
        _count: {
            id: true,
        },
        _sum: {
            quantity: true,
        },
    });

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: orderItems.map((item) => item.productId!).filter(Boolean),
            },
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
        },
    });

    const productsWithSales = orderItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
            id: item.productId!,
            name: product?.name || "Unknown Product",
            sales: item._count.id,
            totalQuantity: item._sum.quantity || 0,
        };
    });

    // Sort by sales and limit
    return productsWithSales.sort((a, b) => b.sales - a.sales).slice(0, limit);
};

// Get Referral Performance (simplified)
// const getReferralPerformance = async () => {
//     // Get top referrer
//     const topReferrer = await prisma.user.findFirst({
//         where: {
//             referralCount: { gt: 0 },
//         },
//         orderBy: {
//             referralCount: "desc",
//         },
//         select: {
//             name: true,
//             referralCount: true,
//         },
//     });

//     // Get total commissions
//     const totalCommissions = await prisma.commission.aggregate({
//         where: {
//             status: "PAID",
//         },
//         _sum: {
//             amount: true,
//         },
//     });

//     return {
//         topReferrer: topReferrer?.name || "No top referrer yet",
//         referrals: topReferrer?.referralCount || 0,
//         totalCommissions: totalCommissions._sum.amount || 0,
//     };
// };

const getReferralPerformance = async () => {
    // Get top 3 referrers WITH storeCredit
    const topReferrers = await prisma.user.findMany({
        where: {
            referralCount: { gt: 0 },
        },
        orderBy: {
            referralCount: "desc",
        },
        take: 3,
        select: {
            id: true,
            name: true,
            referralCount: true,
            storeCredit: true, // ADD THIS - get storeCredit instead of commission table
        },
    });

    // Return with storeCredit
    return topReferrers.map((referrer) => ({
        topReferrer: referrer.name,
        referrals: referrer.referralCount,
        totalCommissions: referrer.storeCredit || 0, // Use storeCredit
    }));
};

export const adminServices = {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    updateUser,
    getTopSellingProducts,
    getReferralPerformance,
};
