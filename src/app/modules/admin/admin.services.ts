import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";
import bcrypt from "bcryptjs";
import { jwtHelper } from "../../../utils/jwtHelpers";

// Admin login
const adminLogin = async (data: { email: string; password: string }) => {
    // Hardcoded admin credentials (from your Express app)
    if (data.email === "admin@peptide.club" && data.password === "123456") {
        const token = jwtHelper.generateToken({ admin: true }, config.jwt_access_secret!, "7d");

        return { token, admin: true };
    }

    throw new ApiError(401, "Invalid credentials");
};

// Get dashboard stats
const getDashboardStats = async () => {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
    });
    const totalCustomers = await prisma.user.count();
    const totalProducts = await prisma.product.count();

    return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalProducts,
    };
};

// Get all orders
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
const getAllUsers = async () => {
    const users = await prisma.user.findMany({
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
        },
        orderBy: { createdAt: "desc" },
    });

    return users;
};

// Update user
const updateUser = async (id: string, data: { storeCredit?: number; tier?: string; referralCount?: number }) => {
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

export const adminServices = {
    adminLogin,
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUser,
};
