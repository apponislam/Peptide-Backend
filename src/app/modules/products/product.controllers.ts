import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { productServices } from "./product.services";
import sendResponse from "../../../utils/sendResponse.";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const search = req.query.search?.toString() || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy?.toString() || "id";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";

    const result = await productServices.getAllProducts({
        search,
        page,
        limit,
        sortBy,
        sortOrder,
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.data,
        meta: result.meta,
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

// Create product (admin only - optional)
const createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productServices.createProduct(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Product created successfully",
        data: product,
    });
});

// Update product (admin only - optional)
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

// Delete product (admin only - optional)
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

export const productControllers = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
