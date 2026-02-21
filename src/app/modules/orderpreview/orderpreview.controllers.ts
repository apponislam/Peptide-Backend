import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import ApiError from "../../../errors/ApiError";
import { orderPreviewServices } from "./orderpreview.services";
import sendResponse from "../../../utils/sendResponse.";

// Create order preview
// Create order preview
const createOrderPreview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { items, subtotal, shippingAmount, total } = req.body;

    // DETAILED LOGGING
    console.log("===== ORDER PREVIEW DEBUG =====");
    console.log("userId:", userId);
    console.log("items:", items);
    console.log("items type:", typeof items);
    console.log("items is array:", Array.isArray(items));
    console.log("items length:", items?.length);
    console.log("subtotal:", subtotal);
    console.log("subtotal type:", typeof subtotal);
    console.log("shippingAmount:", shippingAmount);
    console.log("shippingAmount type:", typeof shippingAmount);
    console.log("total:", total);
    console.log("total type:", typeof total);
    console.log("full body:", req.body);
    console.log("===============================");

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    // Check each field individually to see which one is missing
    if (!items) {
        console.error("❌ items is missing or falsy");
        throw new ApiError(400, "Missing required fields: items");
    }

    if (subtotal === undefined || subtotal === null) {
        console.error("❌ subtotal is missing");
        throw new ApiError(400, "Missing required fields: subtotal");
    }

    if (shippingAmount === undefined || shippingAmount === null) {
        console.error("❌ shippingAmount is missing");
        throw new ApiError(400, "Missing required fields: shippingAmount");
    }

    if (total === undefined || total === null) {
        console.error("❌ total is missing");
        throw new ApiError(400, "Missing required fields: total");
    }

    if (!Array.isArray(items)) {
        console.error("❌ items is not an array:", typeof items);
        throw new ApiError(400, "Items must be an array");
    }

    if (items.length === 0) {
        console.error("❌ items array is empty");
        throw new ApiError(400, "Items must be a non-empty array");
    }

    const previewId = await orderPreviewServices.createPreview({
        userId,
        items,
        subtotal,
        shippingAmount,
        total,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Order preview created successfully",
        data: { previewId },
    });
});

// Get order preview by ID
const getOrderPreview = catchAsync(async (req: Request, res: Response) => {
    const previewId = req.params.previewId as string;
    const userId = req.user?.id;

    if (!previewId) {
        throw new ApiError(400, "Preview ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const preview = await orderPreviewServices.getPreview(previewId, userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order preview retrieved successfully",
        data: preview,
    });
});

// Delete order preview
const deleteOrderPreview = catchAsync(async (req: Request, res: Response) => {
    const previewId = req.params.previewId as string;
    const userId = req.user?.id;

    if (!previewId) {
        throw new ApiError(400, "Preview ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    await orderPreviewServices.deletePreview(previewId, userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order preview deleted successfully",
        data: null,
    });
});

export const orderPreviewControllers = {
    createOrderPreview,
    getOrderPreview,
    deleteOrderPreview,
};
