import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
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
// const getAllOrders = async () => {
//     const orders = await prisma.order.findMany({
//         include: {
//             user: {
//                 select: { email: true, referralCode: true },
//             },
//         },
//         orderBy: { createdAt: "desc" },
//     });
//     return orders;
// };
const getAllOrders = async (params) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = {};
    // Search by name, email, order ID
    if (params.search) {
        where.OR = [{ name: { contains: params.search, mode: "insensitive" } }, { email: { contains: params.search, mode: "insensitive" } }, { id: { contains: params.search, mode: "insensitive" } }, { trackingNumber: { contains: params.search, mode: "insensitive" } }];
    }
    // Filter by status
    if (params.status) {
        where.status = params.status;
    }
    // Filter by user
    if (params.userId) {
        where.userId = params.userId;
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
    // Amount range filter
    if (params.minAmount !== undefined || params.maxAmount !== undefined) {
        where.total = {};
        if (params.minAmount !== undefined) {
            where.total.gte = params.minAmount;
        }
        if (params.maxAmount !== undefined) {
            where.total.lte = params.maxAmount;
        }
    }
    // Sorting
    const orderBy = { createdAt: "desc" };
    if (params.sortBy) {
        const allowedSortFields = ["createdAt", "total", "status", "name", "email"];
        if (allowedSortFields.includes(params.sortBy)) {
            const sortField = params.sortBy;
            orderBy[sortField] = params.sortOrder || "desc";
        }
    }
    // Get orders with pagination
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        referralCode: true,
                        tier: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                commissions: {
                    select: {
                        amount: true,
                        status: true,
                        referrer: {
                            select: {
                                name: true,
                                email: true,
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
const getAllUsers = async (params) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (params.search) {
        where.OR = [{ name: { contains: params.search, mode: "insensitive" } }, { email: { contains: params.search, mode: "insensitive" } }, { referralCode: { contains: params.search, mode: "insensitive" } }];
    }
    if (params.role) {
        where.role = params.role;
    }
    if (params.tier) {
        where.tier = params.tier;
    }
    const orderBy = { createdAt: "desc" };
    if (params.sortBy) {
        const allowedSortFields = ["name", "email", "createdAt", "role", "tier", "referralCount", "storeCredit"];
        if (allowedSortFields.includes(params.sortBy)) {
            const sortField = params.sortBy;
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
const updateUser = async (id, data) => {
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
            ...(data.tier !== undefined && { tier: data.tier }),
            ...(data.referralCount !== undefined && { referralCount: data.referralCount }),
        },
    });
    return user;
};
const getTopSellingProducts = async (limit = 5) => {
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
                in: orderItems.map((item) => item.productId).filter(Boolean),
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
            id: item.productId,
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
    // Get top 3 referrers
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
        },
    });
    // Get total commissions for EACH referrer from Commission table
    const referralPerformanceArray = await Promise.all(topReferrers.map(async (referrer) => {
        const commissions = await prisma.commission.aggregate({
            where: {
                referrerId: referrer.id,
                status: "PAID",
            },
            _sum: {
                amount: true,
            },
        });
        return {
            topReferrer: referrer.name,
            referrals: referrer.referralCount,
            totalCommissions: commissions._sum.amount || 0,
        };
    }));
    return referralPerformanceArray;
};
// Get single user by ID with full details
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
            isActive: true,
        },
        select: {
            id: true,
            email: true,
            name: true,
            referralCode: true,
            tier: true,
            role: true,
            isActive: true,
            storeCredit: true,
            referralCount: true,
            isReferralValid: true,
            referrerId: true,
            createdAt: true,
            updatedAt: true,
            // Include related data
            referrer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tier: true,
                    referralCode: true,
                },
            },
            referrals: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tier: true,
                    createdAt: true,
                    isReferralValid: true,
                    storeCredit: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            },
            orders: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            unitPrice: true,
                            discountedPrice: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    commissions: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            },
            commissionsEarned: {
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    createdAt: true,
                    order: {
                        select: {
                            id: true,
                            total: true,
                            createdAt: true,
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
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            },
            checkoutSessions: {
                select: {
                    id: true,
                    stripeSessionId: true,
                    paymentStatus: true,
                    createdAt: true,
                    order: {
                        select: {
                            id: true,
                            total: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            },
        },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Calculate user stats
    const totalOrders = user.orders.length;
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const totalCommissionsEarned = user.commissionsEarned.reduce((sum, commission) => sum + commission.amount, 0);
    const validReferrals = user.referrals.filter((ref) => ref.isReferralValid).length;
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await prisma.order.count({
        where: {
            userId: id,
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
    });
    return {
        user,
        stats: {
            totalOrders,
            totalSpent: parseFloat(totalSpent.toFixed(2)),
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
            totalCommissionsEarned: parseFloat(totalCommissionsEarned.toFixed(2)),
            totalReferrals: user.referrals.length,
            validReferrals,
            referralConversionRate: user.referrals.length > 0 ? parseFloat(((validReferrals / user.referrals.length) * 100).toFixed(2)) : 0,
            recentOrdersLast30Days: recentOrders,
            storeCredit: user.storeCredit,
            tier: user.tier,
            referralCount: user.referralCount,
            isReferralValid: user.isReferralValid,
        },
    };
};
export const adminServices = {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    updateUser,
    getTopSellingProducts,
    getReferralPerformance,
    getUserById,
};
//# sourceMappingURL=admin.services.js.map