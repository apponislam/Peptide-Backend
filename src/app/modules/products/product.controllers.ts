// import { Request, Response } from "express";
// import catchAsync from "../../../utils/catchAsync";
// import { productServices } from "./product.services";
// import sendResponse from "../../../utils/sendResponse.";

// const getAllProducts = catchAsync(async (req: Request, res: Response) => {
//     const search = req.query.search?.toString() || "";
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const sortBy = req.query.sortBy?.toString() || "id";
//     const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";

//     const result = await productServices.getAllProducts({
//         search,
//         page,
//         limit,
//         sortBy,
//         sortOrder,
//     });
//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Products retrieved successfully",
//         data: result.data,
//         meta: result.meta,
//     });
// });

// // Get single product
// const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id as string);
//     const product = await productServices.getSingleProduct(id);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Product retrieved successfully",
//         data: product,
//     });
// });

// // Create product (admin only - optional)
// const createProduct = catchAsync(async (req: Request, res: Response) => {
//     const product = await productServices.createProduct(req.body);

//     sendResponse(res, {
//         statusCode: 201,
//         success: true,
//         message: "Product created successfully",
//         data: product,
//     });
// });

// // Update product (admin only - optional)
// const updateProduct = catchAsync(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id as string);
//     const product = await productServices.updateProduct(id, req.body);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Product updated successfully",
//         data: product,
//     });
// });

// // Delete product (admin only - optional)
// const deleteProduct = catchAsync(async (req: Request, res: Response) => {
//     const id = parseInt(req.params.id as string);
//     const product = await productServices.deleteProduct(id);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Product deleted successfully",
//         data: product,
//     });
// });

// export const productControllers = {
//     getAllProducts,
//     getSingleProduct,
//     createProduct,
//     updateProduct,
//     deleteProduct,
// };

import { Request, Response } from "express";
import { productServices } from "./product.services";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";

// Create product
const createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productServices.createProduct(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Product created successfully",
        data: product,
    });
});

// Get all products
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    // Extract query parameters
    const { search = "", page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const products = await productServices.getAllProducts({
        search: search as string,
        skip,
        take: limitNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: products,
    });
});

// Get single product
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.getSingleProduct(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});

// Update product
const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.updateProduct(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});

// Delete product
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.deleteProduct(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product deleted successfully",
        data: product,
    });
});

// Get deleted products (admin only)
const getDeletedProducts = catchAsync(async (req: Request, res: Response) => {
    const products = await productServices.getDeletedProducts();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Deleted products retrieved successfully",
        data: products,
    });
});

// Restore product
const restoreProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.restoreProduct(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product restored successfully",
        data: product,
    });
});

export const productControllers = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,
};
