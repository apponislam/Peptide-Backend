import axios from "axios";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../../errors/ApiError";
import { sendOrderCancelledEmail, sendOrderDeliveredEmail } from "../../../utils/templates/orderEmailTemplate";

const baseUrl = "https://ssapi.shipstation.com";
const apiKey = process.env.SHIPSTATION_API_KEY!;
const apiSecret = process.env.SHIPSTATION_API_SECRET!;

if (!apiKey || !apiSecret) {
    throw new ApiError(500, "ShipStation API credentials are not configured");
}

const getAuthHeader = () => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    return {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
    };
};

// Helper method for paginated API calls
const makePaginatedRequest = async (endpoint: string, params: any = {}) => {
    const { page = 1, limit = 50, ...otherParams } = params;

    const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: getAuthHeader(),
        params: {
            page,
            pageSize: limit,
            ...otherParams,
        },
    });

    // ShipStation API pagination response
    if (response.data && response.data.pages) {
        return {
            orders: response.data.orders || [],
            meta: {
                page: response.data.page || page,
                limit: response.data.pageSize || limit,
                total: response.data.total || 0,
                totalPages: response.data.pages || 1,
            },
        };
    }

    return response.data;
};

const createOrder = async (orderId: string) => {
    try {
        console.log(`Creating ShipStation order for order ID: ${orderId}`);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: true,
            },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        // Check if order has required fields
        if (!order.address || !order.city || !order.state || !order.zip || !order.country) {
            throw new ApiError(400, `Order ${orderId} is missing shipping address fields`);
        }

        // Prepare items for ShipStation
        const shipStationItems = order.items.map((item, index) => ({
            lineItemKey: item.id,
            sku: item.product?.id ? `PROD-${item.product.id}` : `ITEM-${index}`,
            name: item.product?.name || `Product ${index + 1}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            weight: {
                value: 1, // Default weight
                units: "pounds" as const,
            },
        }));

        // Prepare ShipStation order payload
        const shipStationOrder = {
            orderNumber: order.id,
            orderDate: order.createdAt.toISOString(),
            orderStatus: "awaiting_shipment" as const,

            // BILL TO (required by ShipStation)
            billTo: {
                name: order.name,
                street1: order.address,
                city: order.city,
                state: order.state,
                postalCode: order.zip,
                country: order.country,
                phone: order.phone || "",
            },

            // SHIP TO (required by ShipStation)
            shipTo: {
                name: order.name,
                street1: order.address,
                city: order.city,
                state: order.state,
                postalCode: order.zip,
                country: order.country,
                phone: order.phone || "",
            },

            items: shipStationItems,
            amountPaid: order.total,
            taxAmount: 0,
            shippingAmount: order.shipping || 0,
            customerEmail: order.email,
            customerNotes: "Order from website",

            // Required weight field
            weight: {
                value: order.items.length || 1,
                units: "pounds" as const,
            },
        };

        const response = await axios.post(`${baseUrl}/orders/createorder`, shipStationOrder, {
            headers: getAuthHeader(),
            timeout: 30000,
        });

        // Save ShipStation order ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                shipstationOrderId: response.data.orderId,
                updatedAt: new Date(),
            },
        });

        return response.data;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            const shipstationError = error.response.data;
            console.error("ShipStation API Error:", shipstationError);
            throw new ApiError(error.response.status, `ShipStation Error: ${shipstationError.message || shipstationError.error || error.message}`);
        }

        throw new ApiError(500, `Failed to create ShipStation order: ${error.message}`);
    }
};

const getShippingRates = async (orderId: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        const rateRequest = {
            carrierCode: "fedex",
            serviceCode: "fedex_ground",
            packageCode: "package",
            fromPostalCode: "90210",
            toState: order.state,
            toCountry: order.country,
            toPostalCode: order.zip,
            weight: {
                value: 5,
                units: "pounds",
            },
            dimensions: {
                units: "inches",
                length: 10,
                width: 10,
                height: 10,
            },
            confirmation: "delivery",
            residential: true,
        };

        const response = await axios.post(`${baseUrl}/shipments/getrates`, rateRequest, {
            headers: getAuthHeader(),
        });

        return response.data;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            throw new ApiError(error.response.status, `Failed to get shipping rates: ${error.response.data?.message || error.message}`);
        }

        throw new ApiError(500, `Failed to get shipping rates: ${error.message}`);
    }
};

const createLabel = async (orderId: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
            },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        if (!order.shipstationOrderId) {
            throw new ApiError(400, `Order ${orderId} does not have a ShipStation order ID`);
        }

        const shipFromAddress = {
            name: "Jacob Stansfield",
            company: "PEPTIDE.CLUB",
            street1: "5500 West Airport Freeway",
            city: "Irving",
            state: "TX",
            postalCode: "75062",
            country: "US",
            phone: "555-0123",
            residential: false,
        };

        const shipToAddress = {
            name: order.name,
            company: "",
            street1: order.address,
            city: order.city,
            state: order.state,
            postalCode: order.zip,
            country: "US",
            phone: order.phone || "",
            residential: true,
        };

        const labelRequest = {
            orderId: Number(order.shipstationOrderId),
            carrierCode: "stamps_com",
            serviceCode: "usps_first_class_mail",
            packageCode: "package",
            confirmation: "none",
            shipDate: new Date().toISOString().split("T")[0],
            weight: {
                value: 4,
                units: "ounces",
            },
            dimensions: {
                length: 10,
                width: 10,
                height: 10,
                units: "inches",
            },
            shipFrom: shipFromAddress,
            shipTo: shipToAddress,
            testLabel: true,
        };

        const response = await axios.post(`${baseUrl}/orders/createlabelfororder`, labelRequest, {
            headers: getAuthHeader(),
            timeout: 30000,
        });

        await prisma.order.update({
            where: { id: orderId },
            data: {
                trackingNumber: response.data.trackingNumber,
                labelUrl: response.data.labelUrl,
                status: "SHIPPED",
                shipstationOrderId: Number(order.shipstationOrderId),
                updatedAt: new Date(),
            },
        });

        return response.data;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            throw new ApiError(error.response.status, `Failed to create shipping label: ${error.response.data?.message || error.message}`);
        }

        throw new ApiError(500, `Failed to create shipping label: ${error.message}`);
    }
};

const listOrders = async (params?: any) => {
    try {
        return await makePaginatedRequest("/orders", params);
    } catch (error: any) {
        if (error.response) {
            throw new ApiError(error.response.status, `Failed to list orders: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError(500, `Failed to list orders: ${error.message}`);
    }
};

const updateTracking = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        // Update in database
        await prisma.order.update({
            where: { id: orderId },
            data: {
                trackingNumber,
                status: "SHIPPED",
                updatedAt: new Date(),
            },
        });

        // Update in ShipStation API
        const updateData = {
            orderId: orderId,
            trackingNumber: trackingNumber,
            carrierCode: carrier.toLowerCase(),
            notifyCustomer: true,
            notifySalesChannel: true,
        };

        const response = await axios.put(`${baseUrl}/orders/markasshipped`, updateData, {
            headers: getAuthHeader(),
        });

        return response.data;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            throw new ApiError(error.response.status, `Failed to update tracking: ${error.response.data?.message || error.message}`);
        }

        throw new ApiError(500, `Failed to update tracking: ${error.message}`);
    }
};

const markOrderAsShipped = async (orderId: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        // Update order status in database
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "SHIPPED",
                updatedAt: new Date(),
            },
        });

        // Mark as shipped in ShipStation
        const markShippedData = {
            orderId: orderId,
            notifyCustomer: true,
            notifySalesChannel: true,
        };

        const response = await axios.post(`${baseUrl}/orders/markasshipped`, markShippedData, {
            headers: getAuthHeader(),
        });

        return response.data;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.response) {
            throw new ApiError(error.response.status, `Failed to mark order as shipped: ${error.response.data?.message || error.message}`);
        }

        throw new ApiError(500, `Failed to mark order as shipped: ${error.message}`);
    }
};

const getCarriers = async () => {
    try {
        const response = await axios.get(`${baseUrl}/carriers`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new ApiError(error.response.status, `Failed to get carriers: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError(500, `Failed to get carriers: ${error.message}`);
    }
};

const getWarehouses = async () => {
    try {
        const response = await axios.get(`${baseUrl}/warehouses`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new ApiError(error.response.status, `Failed to get warehouses: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError(500, `Failed to get warehouses: ${error.message}`);
    }
};

// Add this function to your shipstation.service.ts
const markAsDelivered = async (orderId: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
            },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "DELIVERED",
                updatedAt: new Date(),
            },
        });

        // Send delivered email
        const emailData = {
            id: order.id,
            user: {
                name: order.user?.name || order.name,
            },
        };

        const email = order.user?.email || order.email;
        if (email) {
            sendOrderDeliveredEmail(email, emailData).catch((error) => {
                console.error("❌ Delivered email failed:", error);
            });
        }

        return {
            success: true,
            orderId,
            status: "DELIVERED",
        };
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to mark order as delivered: ${error.message}`);
    }
};

const cancelOrder = async (orderId: string, reason?: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found`);
        }

        // Only cancel if status is PENDING or PROCESSING
        if (!["PENDING", "PROCESSING"].includes(order.status)) {
            throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
        }

        // Update order status to CANCELLED
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
                updatedAt: new Date(),
            },
        });

        // Restore store credit if used
        if (order.creditApplied > 0) {
            await prisma.user.update({
                where: { id: order.userId },
                data: {
                    storeCredit: {
                        increment: order.creditApplied,
                    },
                },
            });
        }

        // Send cancellation email
        const emailData = {
            id: order.id,
            user: {
                name: order.user?.name || order.name,
            },
            items: order.items.map((item) => ({
                name: item.product?.name || "Product",
                quantity: item.quantity,
            })),
            total: order.total,
        };

        const email = order.user?.email || order.email;
        if (email) {
            sendOrderCancelledEmail(email, emailData).catch((error) => {
                console.error("❌ Cancellation email failed:", error);
            });
        }

        return {
            success: true,
            orderId,
            status: "CANCELLED",
            storeCreditRestored: order.creditApplied,
        };
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to cancel order: ${error.message}`);
    }
};

export const shipStationService = {
    createOrder,
    getShippingRates,
    createLabel,
    listOrders,
    updateTracking,
    markOrderAsShipped,
    getCarriers,
    getWarehouses,
    markAsDelivered,
    cancelOrder,
};
