// import { prisma } from "../../../lib/prisma";
// import ApiError from "../../../errors/ApiError";
// import { Prisma } from "../../../generated/prisma/client";
// interface GetProductsQuery {
//     search?: string;
//     page?: number;
//     limit?: number;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
// }
// const getAllProducts = async (query: GetProductsQuery) => {
//     try {
//         const { search = "", page = 1, limit = 10, sortBy = "id", sortOrder = "asc" } = query;
//         // Convert to numbers and validate
//         const pageNumber = Math.max(1, Number(page));
//         const pageSize = Math.min(Math.max(1, Number(limit)), 100); // Max 100 items per page
//         const skip = (pageNumber - 1) * pageSize;
//         // Build where clause for search
//         const where: Prisma.ProductWhereInput = {};
//         if (search) {
//             where.OR = [
//                 {
//                     name: {
//                         contains: search,
//                         mode: "insensitive",
//                     },
//                 },
//                 {
//                     desc: {
//                         contains: search,
//                         mode: "insensitive",
//                     },
//                 },
//                 {
//                     details: {
//                         contains: search,
//                         mode: "insensitive",
//                     },
//                 },
//             ];
//         }
//         // Validate sort field to prevent SQL injection
//         const allowedSortFields = ["id", "name", "createdAt", "updatedAt"];
//         const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "id";
//         const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
//         // Execute queries in parallel
//         const [products, total] = await Promise.all([
//             prisma.product.findMany({
//                 where,
//                 skip,
//                 take: pageSize,
//                 orderBy: {
//                     [validSortBy]: validSortOrder,
//                 },
//             }),
//             prisma.product.count({ where }),
//         ]);
//         const totalPages = Math.ceil(total / pageSize);
//         return {
//             data: products,
//             meta: {
//                 page: pageNumber,
//                 limit: pageSize,
//                 total,
//                 totalPages,
//             },
//         };
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         throw new ApiError(500, "Failed to fetch products");
//     }
// };
// // Get single product by ID
// const getSingleProduct = async (id: number) => {
//     try {
//         const product = await prisma.product.findUnique({
//             where: { id },
//         });
//         if (!product) {
//             throw new ApiError(404, "Product not found");
//         }
//         return product;
//     } catch (error) {
//         if (error instanceof ApiError) {
//             throw error;
//         }
//         throw new ApiError(500, "Failed to fetch product");
//     }
// };
// // Create product (admin only - optional)
// const createProduct = async (data: Prisma.ProductCreateInput) => {
//     try {
//         const product = await prisma.product.create({
//             data,
//         });
//         return product;
//     } catch (error) {
//         throw new ApiError(500, "Failed to create product");
//     }
// };
// // Update product (admin only - optional)
// const updateProduct = async (id: number, data: Prisma.ProductUpdateInput) => {
//     try {
//         const existingProduct = await prisma.product.findUnique({
//             where: { id },
//         });
//         if (!existingProduct) {
//             throw new ApiError(404, "Product not found");
//         }
//         const product = await prisma.product.update({
//             where: { id },
//             data,
//         });
//         return product;
//     } catch (error) {
//         if (error instanceof ApiError) {
//             throw error;
//         }
//         throw new ApiError(500, "Failed to update product");
//     }
// };
// // Delete product (admin only - optional)
// const deleteProduct = async (id: number) => {
//     try {
//         const existingProduct = await prisma.product.findUnique({
//             where: { id },
//         });
//         if (!existingProduct) {
//             throw new ApiError(404, "Product not found");
//         }
//         const product = await prisma.product.delete({
//             where: { id },
//         });
//         return product;
//     } catch (error) {
//         if (error instanceof ApiError) {
//             throw error;
//         }
//         throw new ApiError(500, "Failed to delete product");
//     }
// };
// export const productServices = {
//     getAllProducts,
//     getSingleProduct,
//     createProduct,
//     updateProduct,
//     deleteProduct,
// };
import ApiError from "../../../errors/ApiError";
import { prisma } from "../../../lib/prisma";
import httpStatus from "http-status";
// Create product
const createProduct = async (data) => {
    const product = await prisma.product.create({
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
    const products = await prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    // Get total count for pagination
    const total = await prisma.product.count({ where });
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
    const product = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }
    return product;
};
// Update product
const updateProduct = async (id, data) => {
    const existingProduct = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!existingProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
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
    const product = await prisma.product.update({
        where: { id },
        data: updateData,
    });
    return product;
};
// Soft delete product
const deleteProduct = async (id) => {
    const existingProduct = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });
    if (!existingProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }
    const product = await prisma.product.update({
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
    const products = await prisma.product.findMany({
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
    const existingProduct = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: true,
        },
    });
    if (!existingProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found or not deleted");
    }
    const product = await prisma.product.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
    return product;
};
export const productServices = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,
};
//# sourceMappingURL=product.services.js.map