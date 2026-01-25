import { Request, Response } from "express";
import { shipStationService } from "./shipstation.service";

export class ShipStationController {
    // Create ShipStation order
    static async createOrder(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const result = await shipStationService.createOrder(orderIdStr);

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error("Create ShipStation order error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create ShipStation order",
            });
        }
    }

    // Get shipping rates
    static async getShippingRates(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const rates = await shipStationService.getShippingRates(orderIdStr);

            res.json({
                success: true,
                rates,
            });
        } catch (error: any) {
            console.error("Get shipping rates error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get shipping rates",
            });
        }
    }

    // Create shipping label
    static async createLabel(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const label = await shipStationService.createLabel(orderIdStr);

            res.json({
                success: true,
                label,
            });
        } catch (error: any) {
            console.error("Create label error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to create shipping label",
            });
        }
    }

    // List ShipStation orders
    static async listOrders(req: Request, res: Response) {
        try {
            const orders = await shipStationService.listOrders(req.query);

            res.json({
                success: true,
                orders,
            });
        } catch (error: any) {
            console.error("List orders error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to list orders",
            });
        }
    }

    // Update order tracking
    static async updateTracking(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { trackingNumber, carrier } = req.body;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const result = await shipStationService.updateTracking(orderIdStr, trackingNumber, carrier);

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error("Update tracking error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to update tracking",
            });
        }
    }

    // Mark order as shipped
    static async markAsShipped(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

            if (!orderIdStr) {
                return res.status(400).json({
                    success: false,
                    error: "orderId is required",
                });
            }

            const result = await shipStationService.markOrderAsShipped(orderIdStr);

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error("Mark as shipped error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to mark order as shipped",
            });
        }
    }

    static async getCarriers(req: Request, res: Response) {
        try {
            const result = await shipStationService.getCarriers();

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error("Get carriers error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get carriers",
            });
        }
    }
}
