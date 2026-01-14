import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
const getAllProducts = async (query) => {
    try {
        const { search = "", page = 1, limit = 10, sortBy = "id", sortOrder = "asc" } = query;
        // Convert to numbers and validate
        const pageNumber = Math.max(1, Number(page));
        const pageSize = Math.min(Math.max(1, Number(limit)), 100); // Max 100 items per page
        const skip = (pageNumber - 1) * pageSize;
        // Build where clause for search
        const where = {};
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    desc: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    details: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }
        // Validate sort field to prevent SQL injection
        const allowedSortFields = ["id", "name", "createdAt", "updatedAt"];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "id";
        const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
        // Execute queries in parallel
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: {
                    [validSortBy]: validSortOrder,
                },
            }),
            prisma.product.count({ where }),
        ]);
        const totalPages = Math.ceil(total / pageSize);
        return {
            data: products,
            meta: {
                page: pageNumber,
                limit: pageSize,
                total,
                totalPages,
            },
        };
    }
    catch (error) {
        console.error("Error fetching products:", error);
        throw new ApiError(500, "Failed to fetch products");
    }
};
// Get single product by ID
const getSingleProduct = async (id) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        return product;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to fetch product");
    }
};
// Create product (admin only - optional)
const createProduct = async (data) => {
    try {
        const product = await prisma.product.create({
            data,
        });
        return product;
    }
    catch (error) {
        throw new ApiError(500, "Failed to create product");
    }
};
// Update product (admin only - optional)
const updateProduct = async (id, data) => {
    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new ApiError(404, "Product not found");
        }
        const product = await prisma.product.update({
            where: { id },
            data,
        });
        return product;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to update product");
    }
};
// Delete product (admin only - optional)
const deleteProduct = async (id) => {
    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new ApiError(404, "Product not found");
        }
        const product = await prisma.product.delete({
            where: { id },
        });
        return product;
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to delete product");
    }
};
export const productServices = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
//# sourceMappingURL=product.services.js.map