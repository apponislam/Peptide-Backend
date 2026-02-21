import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import ApiError from "../../../errors/ApiError";
import { orderPreviewServices } from "./orderpreview.services";
import sendResponse from "../../../utils/sendResponse.";

// Create order preview
const createOrderPreview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { items, subtotal, shippingAmount, total } = req.body;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!items || !subtotal || !shippingAmount || !total) {
        throw new ApiError(400, "Missing required fields");
    }

    if (!Array.isArray(items) || items.length === 0) {
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
