// import { Request, Response } from "express";
// import catchAsync from "../../../utils/catchAsync";
// import { productServices } from "./product.services";
// import sendResponse from "../../../utils/sendResponse.";
import { productServices } from "./product.services";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";
// Create product
const createProduct = catchAsync(async (req, res) => {
    const product = await productServices.createProduct(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Product created successfully",
        data: product,
    });
});
// Get all products
const getAllProducts = catchAsync(async (req, res) => {
    // Extract query parameters
    const { search = "", page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const result = await productServices.getAllProducts({
        search: search,
        skip,
        take: limitNum,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.products,
        meta: result.meta,
    });
});
// Get single product
const getSingleProduct = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await productServices.getSingleProduct(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});
// Update product
const updateProduct = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await productServices.updateProduct(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});
// Delete product
const deleteProduct = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await productServices.deleteProduct(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product deleted successfully",
        data: product,
    });
});
// Get deleted products (admin only)
const getDeletedProducts = catchAsync(async (req, res) => {
    const products = await productServices.getDeletedProducts();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Deleted products retrieved successfully",
        data: products,
    });
});
// Restore product
const restoreProduct = catchAsync(async (req, res) => {
    const id = parseInt(req.params.id);
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
//# sourceMappingURL=product.controllers.js.map