import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
import { Prisma } from "../../../generated/prisma/client";

// Get all products
const getAllProducts = async () => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                id: "asc",
            },
        });
        return products;
    } catch (error) {
        throw new ApiError(500, "Failed to fetch products");
    }
};

// Get single product by ID
const getSingleProduct = async (id: number) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        return product;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to fetch product");
    }
};

// Create product (admin only - optional)
const createProduct = async (data: Prisma.ProductCreateInput) => {
    try {
        const product = await prisma.product.create({
            data,
        });
        return product;
    } catch (error) {
        throw new ApiError(500, "Failed to create product");
    }
};

// Update product (admin only - optional)
const updateProduct = async (id: number, data: Prisma.ProductUpdateInput) => {
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
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to update product");
    }
};

// Delete product (admin only - optional)
const deleteProduct = async (id: number) => {
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
    } catch (error) {
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
