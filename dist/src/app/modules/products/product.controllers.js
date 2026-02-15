"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productControllers = void 0;
const product_services_1 = require("./product.services");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
// Create product
const createProduct = (0, catchAsync_1.default)(async (req, res) => {
    const product = await product_services_1.productServices.createProduct(req.body);
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
    const product = await product_services_1.productServices.updateProduct(id, req.body);
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
exports.productControllers = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getDeletedProducts,
    restoreProduct,
};
//# sourceMappingURL=product.controllers.js.map