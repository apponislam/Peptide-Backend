// import ApiError from "../../../errors/ApiError";
// import { prisma } from "../../../lib/prisma";
// import httpStatus from "http-status";

// interface ProductSize {
//     mg: number;
//     price: number;
//     quantity: number;
// }

// interface ProductReference {
//     url: string;
//     title: string;
// }

// interface ProductCOA {
//     batchNumber: string;
//     purity: string;
//     testedDate: string;
//     testedBy: string;
// }

// interface CreateProductData {
//     name: string;
//     sizes: ProductSize[];
//     desc: string;
//     details: string;
//     references: ProductReference[];
//     coa?: ProductCOA;
//     image?: string;
// }

// interface UpdateProductData {
//     name?: string;
//     sizes?: ProductSize[];
//     desc?: string;
//     details?: string;
//     references?: ProductReference[];
//     coa?: ProductCOA;
//     isDeleted?: boolean;
// }

// // Create product
// const createProduct = async (data: CreateProductData) => {
//     const product = await prisma.product.create({
//         data: {
//             name: data.name,
//             sizes: data.sizes as any,
//             desc: data.desc,
//             details: data.details,
//             references: data.references as any,
//             coa: (data.coa as any) || null,
//         },
//     });

//     return product;
// };

// interface GetAllProductsOptions {
//     search?: string;
//     skip?: number;
//     take?: number;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
// }

// const getAllProducts = async (options: GetAllProductsOptions = {}) => {
//     const { search = "", skip = 0, take = 12, sortBy = "createdAt", sortOrder = "desc" } = options;

//     const where: any = {
//         isDeleted: false,
//     };

//     // Add search filter if provided
//     if (search) {
//         where.name = {
//             contains: search,
//             mode: "insensitive" as const,
//         };
//     }

//     const products = await prisma.product.findMany({
//         where,
//         skip,
//         take,
//         orderBy: {
//             [sortBy]: sortOrder,
//         },
//     });

//     // Get total count for pagination
//     const total = await prisma.product.count({ where });

//     return {
//         products,
//         meta: {
//             page: Math.floor(skip / take) + 1,
//             limit: take,
//             total,
//             totalPages: Math.ceil(total / take),
//         },
//     };
// };

// // Get single product by ID
// const getSingleProduct = async (id: number) => {
//     const product = await prisma.product.findFirst({
//         where: {
//             id,
//             isDeleted: false,
//         },
//     });

//     if (!product) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
//     }

//     return product;
// };

// // Update product
// const updateProduct = async (id: number, data: UpdateProductData) => {
//     const existingProduct = await prisma.product.findFirst({
//         where: {
//             id,
//             isDeleted: false,
//         },
//     });

//     if (!existingProduct) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
//     }

//     // Prepare update data
//     const updateData: any = {};

//     // Handle regular fields
//     if (data.name !== undefined) updateData.name = data.name;
//     if (data.desc !== undefined) updateData.desc = data.desc;
//     if (data.details !== undefined) updateData.details = data.details;

//     // Handle JSON fields
//     if (data.sizes !== undefined) updateData.sizes = data.sizes;
//     if (data.references !== undefined) updateData.references = data.references;
//     if (data.coa !== undefined) updateData.coa = data.coa;

//     // Handle deletion
//     if (data.isDeleted !== undefined) {
//         updateData.isDeleted = data.isDeleted;
//         updateData.deletedAt = data.isDeleted ? new Date() : null;
//     }

//     const product = await prisma.product.update({
//         where: { id },
//         data: updateData,
//     });

//     return product;
// };

// // Soft delete product
// const deleteProduct = async (id: number) => {
//     const existingProduct = await prisma.product.findFirst({
//         where: {
//             id,
//             isDeleted: false,
//         },
//     });

//     if (!existingProduct) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
//     }

//     const product = await prisma.product.update({
//         where: { id },
//         data: {
//             isDeleted: true,
//             deletedAt: new Date(),
//         },
//     });

//     return product;
// };

// // Get deleted products (admin only)
// const getDeletedProducts = async () => {
//     const products = await prisma.product.findMany({
//         where: {
//             isDeleted: true,
//         },
//         orderBy: {
//             deletedAt: "desc",
//         },
//     });

//     return products;
// };

// // Restore deleted product
// const restoreProduct = async (id: number) => {
//     const existingProduct = await prisma.product.findFirst({
//         where: {
//             id,
//             isDeleted: true,
//         },
//     });

//     if (!existingProduct) {
//         throw new ApiError(httpStatus.NOT_FOUND, "Product not found or not deleted");
//     }

//     const product = await prisma.product.update({
//         where: { id },
//         data: {
//             isDeleted: false,
//             deletedAt: null,
//         },
//     });

//     return product;
// };

// export const productServices = {
//     createProduct,
//     getAllProducts,
//     getSingleProduct,
//     updateProduct,
//     deleteProduct,
//     getDeletedProducts,
//     restoreProduct,
// };

import ApiError from "../../../errors/ApiError";
import { prisma } from "../../../lib/prisma";
import httpStatus from "http-status";

interface ProductSize {
    mg: number;
    price: number;
    quantity: number;
}

interface ProductReference {
    url: string;
    title: string;
}

interface ProductCOA {
    url: string; // file path
    filename: string; // original filename
    mimetype: string; // file type
    size: number; // file size in bytes
}

interface CreateProductData {
    name: string;
    sizes: ProductSize[];
    desc: string;
    details: string;
    references: ProductReference[];
    coa?: ProductCOA; // Now an object with file details
    image?: string; // main product image URL
}

interface UpdateProductData {
    name?: string;
    sizes?: ProductSize[];
    desc?: string;
    details?: string;
    references?: ProductReference[];
    coa?: ProductCOA;
    image?: string;
    isDeleted?: boolean;
}

// Create product
const createProduct = async (data: CreateProductData) => {
    const product = await prisma.product.create({
        data: {
            name: data.name,
            sizes: data.sizes as any,
            desc: data.desc,
            details: data.details,
            references: data.references as any,
            coa: (data.coa as any) || null,
            image: data.image || null,
        },
    });

    return product;
};

interface GetAllProductsOptions {
    search?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// const getAllProducts = async (options: GetAllProductsOptions = {}) => {
//     const { search = "", skip = 0, take = 12, sortBy = "createdAt", sortOrder = "desc" } = options;

//     const where: any = {
//         isDeleted: false,
//         inStock: true,
//         sizes: {
//             array_contains: [
//                 {
//                     quantity: {
//                         gt: 0,
//                     },
//                 },
//             ],
//         },
//     };

//     // Add search filter if provided
//     if (search) {
//         where.name = {
//             contains: search,
//             mode: "insensitive" as const,
//         };
//     }

//     const products = await prisma.product.findMany({
//         where,
//         skip,
//         take,
//         orderBy: {
//             [sortBy]: sortOrder,
//         },
//     });

//     const total = await prisma.product.count({ where });

//     return {
//         products,
//         meta: {
//             page: Math.floor(skip / take) + 1,
//             limit: take,
//             total,
//             totalPages: Math.ceil(total / take),
//         },
//     };
// };

// Get single product by ID

const getAllProducts = async (options: GetAllProductsOptions = {}) => {
    const { search = "", skip = 0, take = 12, sortBy = "createdAt", sortOrder = "desc" } = options;

    // First, get ALL products without any filter to see what's there
    const allProductsUnfiltered = await prisma.product.findMany({
        where: {
            isDeleted: false,
            inStock: true,
        },
    });

    // console.log("Total products in DB:", allProductsUnfiltered.length);
    // console.log("First product sizes:", allProductsUnfiltered[0]?.sizes);

    const where: any = {
        isDeleted: false,
        inStock: true,
    };

    // Add search filter if provided
    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive" as const,
        };
    }

    // Get all products first
    const allProducts = await prisma.product.findMany({
        where,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    // console.log("Products after basic filters:", allProducts.length);

    // Filter in JavaScript
    const filteredProducts = allProducts.filter((product) => {
        const sizes = product.sizes as Array<{ quantity: number }>;
        const hasStock = sizes.some((size) => size.quantity > 0);
        if (!hasStock) {
            console.log(`Product ${product.id} - ${product.name} has no stock:`, sizes);
        }
        return hasStock;
    });

    // console.log("Products after stock filter:", filteredProducts.length);

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(skip, skip + take);
    const total = filteredProducts.length;

    return {
        products: paginatedProducts,
        meta: {
            page: Math.floor(skip / take) + 1,
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
        },
    };
};

const getSingleProduct = async (id: number) => {
    // First get the product without the quantity filter
    const product = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
            inStock: true,
        },
    });

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    // Then check if it has any size with quantity > 0
    const sizes = product.sizes as Array<{ quantity: number }>;
    const hasStock = sizes.some((size) => size.quantity > 0);

    if (!hasStock) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not available");
    }

    return product;
};

// Update product
const updateProduct = async (id: number, data: UpdateProductData) => {
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
    const updateData: any = {};

    // Handle regular fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.desc !== undefined) updateData.desc = data.desc;
    if (data.details !== undefined) updateData.details = data.details;
    if (data.image !== undefined) updateData.image = data.image; // Add image field

    // Handle JSON fields
    if (data.sizes !== undefined) updateData.sizes = data.sizes;
    if (data.references !== undefined) updateData.references = data.references;
    if (data.coa !== undefined) updateData.coa = data.coa;

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
const deleteProduct = async (id: number) => {
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
const restoreProduct = async (id: number) => {
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

// Admin route - get all products (only isDeleted: false)
const getAllProductsAdmin = async (options: GetAllProductsOptions = {}) => {
    const { search = "", skip = 0, take = 12, sortBy = "createdAt", sortOrder = "desc" } = options;

    const where: any = {
        isDeleted: false,
    };

    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive" as const,
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

// Admin route - get single product (only isDeleted: false)
const getSingleProductAdmin = async (id: number) => {
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

const getProductsByIds = async (ids: number[]) => {
    // Remove duplicates
    const uniqueIds = [...new Set(ids)];

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: uniqueIds,
            },
            isDeleted: false,
            inStock: true,
        },
    });

    // Create a map for easy lookup
    const productMap = new Map();
    products.forEach((product) => {
        productMap.set(product.id, product);
    });

    return {
        products,
        productMap,
    };
};

export const productServices = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,

    // for admin
    getAllProductsAdmin,
    getSingleProductAdmin,

    // for repeat
    getProductsByIds,
};
