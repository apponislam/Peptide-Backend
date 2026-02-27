import { Request, Response } from "express";
import { productServices } from "./product.services";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";
import ApiError from "../../../errors/ApiError";
import HttpStatus from "http-status";

// Create product
const createProduct = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Parse JSON fields
    const productData: any = {
        name: req.body.name,
        desc: req.body.desc,
        details: req.body.details,
    };

    // Parse JSON fields (if they come as strings from FormData)
    if (req.body.sizes) productData.sizes = JSON.parse(req.body.sizes);
    if (req.body.references) productData.references = JSON.parse(req.body.references);

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

    const product = await productServices.createProduct(productData);

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

    const result = await productServices.getAllProducts({
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
        data: result.products,
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

// Update product
const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Build update data dynamically
    const updateData: any = {};

    // Handle regular fields
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.desc) updateData.desc = req.body.desc;
    if (req.body.details) updateData.details = req.body.details;

    // Handle JSON fields (parse if they come as strings)
    if (req.body.sizes) updateData.sizes = JSON.parse(req.body.sizes);
    if (req.body.references) updateData.references = JSON.parse(req.body.references);

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

    const product = await productServices.updateProduct(id, updateData);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});

const removeProductItem = catchAsync(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id as string);
    const { type, mg } = req.body; // type: 'image' | 'coa' | 'size'

    const result = await productServices.removeProductItem(productId, type, mg);

    const message = type === "size" ? `Product size (${mg}mg) removed successfully` : `Product ${type} removed successfully`;

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message,
        data: result,
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

// Admin - get all products
const getAllProductsAdmin = catchAsync(async (req: Request, res: Response) => {
    const { search = "", page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const result = await productServices.getAllProductsAdmin({
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
        data: result.products,
        meta: result.meta,
    });
});

// Admin - get single product
const getSingleProductAdmin = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.getSingleProductAdmin(id); // Calls admin version

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});

const getProductsByIds = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Product IDs are required");
    }

    const result = await productServices.getProductsByIds(ids);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieved successfully",
        data: result.products,
    });
});

// Toggle product inStock status
const toggleProductStock = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const product = await productServices.toggleProductStock(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Product stock status toggled to ${product.inStock ? "in stock" : "out of stock"}`,
        data: product,
    });
});

export const productControllers = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    removeProductItem,
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
