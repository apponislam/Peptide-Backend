import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";

// Create order preview
const createPreview = async (data: { userId: string; items: any[]; subtotal: number; shippingAmount: number; total: number }) => {
    try {
        // Set expiration to 30 minutes from now
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        // Store items as JSON string
        const itemsJson = JSON.stringify(data.items);

        const preview = await prisma.orderPreview.create({
            data: {
                userId: data.userId,
                items: itemsJson,
                subtotal: data.subtotal,
                shipping: data.shippingAmount,
                total: data.total,
                expiresAt: expiresAt,
            },
        });

        return preview.id;
    } catch (error: any) {
        throw new ApiError(500, `Failed to create order preview: ${error.message}`);
    }
};

// Get order preview by ID
const getPreview = async (previewId: string, userId: string) => {
    try {
        const preview = await prisma.orderPreview.findUnique({
            where: { id: previewId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        tier: true,
                    },
                },
            },
        });

        if (!preview) {
            throw new ApiError(404, "Order preview not found");
        }

        // Check if user owns this preview
        if (preview.userId !== userId) {
            throw new ApiError(403, "You are not authorized to view this preview");
        }

        // Check if expired
        if (preview.expiresAt < new Date()) {
            // Delete expired preview
            await prisma.orderPreview.delete({
                where: { id: previewId },
            });
            throw new ApiError(410, "Order preview has expired");
        }

        // Parse items from JSON
        const items = JSON.parse(preview.items);

        return {
            id: preview.id,
            userId: preview.userId,
            items,
            subtotal: preview.subtotal,
            shipping: preview.shipping,
            total: preview.total,
            expiresAt: preview.expiresAt,
            createdAt: preview.createdAt,
            user: preview.user,
        };
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to get order preview: ${error.message}`);
    }
};

// Delete order preview
const deletePreview = async (previewId: string, userId: string) => {
    try {
        // First check if preview exists and belongs to user
        const preview = await prisma.orderPreview.findUnique({
            where: { id: previewId },
        });

        if (!preview) {
            throw new ApiError(404, "Order preview not found");
        }

        if (preview.userId !== userId) {
            throw new ApiError(403, "You are not authorized to delete this preview");
        }

        await prisma.orderPreview.delete({
            where: { id: previewId },
        });

        return true;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to delete order preview: ${error.message}`);
    }
};

// Clean up expired previews (can be run as a cron job)
const cleanupExpiredPreviews = async () => {
    try {
        const result = await prisma.orderPreview.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    } catch (error: any) {
        throw new ApiError(500, `Failed to cleanup expired previews: ${error.message}`);
    }
};

export const orderPreviewServices = {
    createPreview,
    getPreview,
    deletePreview,
    cleanupExpiredPreviews,
};
