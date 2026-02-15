"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productServices = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = require("../../../lib/prisma");
const http_status_1 = __importDefault(require("http-status"));
// Create product
const createProduct = async (data) => {
    const product = await prisma_1.prisma.product.create({
        data: {
            name: data.name,
            sizes: data.sizes,
            desc: data.desc,
            details: data.details,
            references: data.references,
            coa: data.coa || null,
        },
    });
    return product;
};
const getAllProducts = async (options = {}) => {
    const { search = "", skip = 0, take = 12, sortBy = "createdAt", sortOrder = "desc" } = options;
    const where = {
        isDeleted: false,
    };
    // Add search filter if provided
    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive",
        };
    }
    const products = await prisma_1.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    // Get total count for pagination
    const total = await prisma_1.prisma.product.count({ where });
    return {
        products,
        meta: {
            page: Math.floor(skip / take) + 1,
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
        },
    };
};
// Get single product by ID
const getSingleProduct = async (id) => {
    const product = await prisma_1.prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return product;
};
// Update product
const updateProduct = async (id, data) => {
    const existingProduct = await prisma_1.prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!existingProduct) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    // Prepare update data
    const updateData = {};
    // Handle regular fields
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.desc !== undefined)
        updateData.desc = data.desc;
    if (data.details !== undefined)
        updateData.details = data.details;
    // Handle JSON fields
    if (data.sizes !== undefined)
        updateData.sizes = data.sizes;
    if (data.references !== undefined)
        updateData.references = data.references;
    if (data.coa !== undefined)
        updateData.coa = data.coa;
    // Handle deletion
    if (data.isDeleted !== undefined) {
        updateData.isDeleted = data.isDeleted;
        updateData.deletedAt = data.isDeleted ? new Date() : null;
    }
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data: updateData,
    });
    return product;
};
// Soft delete product
const deleteProduct = async (id) => {
    const existingProduct = await prisma_1.prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!existingProduct) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
    return product;
};
// Get deleted products (admin only)
const getDeletedProducts = async () => {
    const products = await prisma_1.prisma.product.findMany({
        where: {
            isDeleted: true,
        },
        orderBy: {
            deletedAt: "desc",
        },
    });
    return products;
};
// Restore deleted product
const restoreProduct = async (id) => {
    const existingProduct = await prisma_1.prisma.product.findFirst({
        where: {
            id,
            isDeleted: true,
        },
    });
    if (!existingProduct) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found or not deleted");
    }
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
    return product;
};
exports.productServices = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,
};
//# sourceMappingURL=product.services.js.map