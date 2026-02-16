"use strict";
// import { Request, Response } from "express";
// import { productServices } from "./product.services";
// import catchAsync from "../../../utils/catchAsync";
// import sendResponse from "../../../utils/sendResponse.";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productControllers = void 0;
const product_services_1 = require("./product.services");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
// Create product
const createProduct = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    // Parse JSON fields
    const productData = {
        name: req.body.name,
        desc: req.body.desc,
        details: req.body.details,
    };
    // Parse JSON fields (if they come as strings from FormData)
    if (req.body.sizes)
        productData.sizes = JSON.parse(req.body.sizes);
    if (req.body.references)
        productData.references = JSON.parse(req.body.references);
    // Handle image file
    if (files?.image?.[0]) {
        productData.image = `/uploads/product-images/${files.image[0].filename}`;
    }
    // Handle COA file (store as object with file details)
    if (files?.coa?.[0]) {
        productData.coa = {
            url: `/uploads/coa/${files.coa[0].filename}`,
            filename: files.coa[0].originalname,
            mimetype: files.coa[0].mimetype,
            size: files.coa[0].size,
        };
    }
    const product = await product_services_1.productServices.createProduct(productData);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Product created successfully",
        data: product,
    });
});
// Get all products
const getAllProducts = (0, catchAsync_1.default)(async (req, res) => {
    // Extract query parameters
    const { search = "", page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const result = await product_services_1.productServices.getAllProducts({
        search: search,
        skip,
        take: limitNum,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.products,
        meta: result.meta,
    });
});
// Get single product
const getSingleProduct = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await product_services_1.productServices.getSingleProduct(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});
// Update product
const updateProduct = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const files = req.files;
    // Build update data dynamically
    const updateData = {};
    // Handle regular fields
    if (req.body.name)
        updateData.name = req.body.name;
    if (req.body.desc)
        updateData.desc = req.body.desc;
    if (req.body.details)
        updateData.details = req.body.details;
    // Handle JSON fields (parse if they come as strings)
    if (req.body.sizes)
        updateData.sizes = JSON.parse(req.body.sizes);
    if (req.body.references)
        updateData.references = JSON.parse(req.body.references);
    // Handle image file
    if (files?.image?.[0]) {
        updateData.image = `/uploads/product-images/${files.image[0].filename}`;
    }
    // Handle COA file
    if (files?.coa?.[0]) {
        updateData.coa = {
            url: `/uploads/coa/${files.coa[0].filename}`,
            filename: files.coa[0].originalname,
            mimetype: files.coa[0].mimetype,
            size: files.coa[0].size,
        };
    }
    const product = await product_services_1.productServices.updateProduct(id, updateData);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});
// Delete product
const deleteProduct = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await product_services_1.productServices.deleteProduct(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Product deleted successfully",
        data: product,
    });
});
// Get deleted products (admin only)
const getDeletedProducts = (0, catchAsync_1.default)(async (req, res) => {
    const products = await product_services_1.productServices.getDeletedProducts();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Deleted products retrieved successfully",
        data: products,
    });
});
// Restore product
const restoreProduct = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await product_services_1.productServices.restoreProduct(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Product restored successfully",
        data: product,
    });
});
// Admin - get all products
const getAllProductsAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const { search = "", page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const result = await product_services_1.productServices.getAllProductsAdmin({
        search: search,
        skip,
        take: limitNum,
        sortBy: sortBy,
        sortOrder: sortOrder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.products,
        meta: result.meta,
    });
});
// Admin - get single product
const getSingleProductAdmin = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await product_services_1.productServices.getSingleProductAdmin(id); // Calls admin version
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});
const getProductsByIds = (0, catchAsync_1.default)(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Product IDs are required");
    }
    const result = await product_services_1.productServices.getProductsByIds(ids);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.products,
    });
});
// Toggle product inStock status
const toggleProductStock = (0, catchAsync_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await product_services_1.productServices.toggleProductStock(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Product stock status toggled to ${product.inStock ? "in stock" : "out of stock"}`,
        data: product,
    });
});
exports.productControllers = {
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
    toggleProductStock,
    // for repeat order
    getProductsByIds,
};
//# sourceMappingURL=product.controllers.js.map