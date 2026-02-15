"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipStationService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../../../lib/prisma");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const orderEmailTemplate_1 = require("../../../utils/templates/orderEmailTemplate");
const baseUrl = "https://ssapi.shipstation.com";
const apiKey = process.env.SHIPSTATION_API_KEY;
const apiSecret = process.env.SHIPSTATION_API_SECRET;
if (!apiKey || !apiSecret) {
    throw new ApiError_1.default(500, "ShipStation API credentials are not configured");
}
const getAuthHeader = () => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    return {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
    };
};
// Helper method for paginated API calls
const makePaginatedRequest = async (endpoint, params = {}) => {
    const { page = 1, limit = 50, ...otherParams } = params;
    const response = await axios_1.default.get(`${baseUrl}${endpoint}`, {
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
const createOrder = async (orderId) => {
    try {
        console.log(`Creating ShipStation order for order ID: ${orderId}`);
        const order = await prisma_1.prisma.order.findUnique({
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
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        // Check if order has required fields
        if (!order.address || !order.city || !order.state || !order.zip || !order.country) {
            throw new ApiError_1.default(400, `Order ${orderId} is missing shipping address fields`);
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
                units: "pounds",
            },
        }));
        // Prepare ShipStation order payload
        const shipStationOrder = {
            orderNumber: order.id,
            orderDate: order.createdAt.toISOString(),
            orderStatus: "awaiting_shipment",
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
                units: "pounds",
            },
        };
        const response = await axios_1.default.post(`${baseUrl}/orders/createorder`, shipStationOrder, {
            headers: getAuthHeader(),
            timeout: 30000,
        });
        // Save ShipStation order ID
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                shipstationOrderId: response.data.orderId,
                updatedAt: new Date(),
            },
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        if (error.response) {
            const shipstationError = error.response.data;
            console.error("ShipStation API Error:", shipstationError);
            throw new ApiError_1.default(error.response.status, `ShipStation Error: ${shipstationError.message || shipstationError.error || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to create ShipStation order: ${error.message}`);
    }
};
const getShippingRates = async (orderId) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
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
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
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
        const response = await axios_1.default.post(`${baseUrl}/shipments/getrates`, rateRequest, {
            headers: getAuthHeader(),
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to get shipping rates: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to get shipping rates: ${error.message}`);
    }
};
const createLabel = async (orderId) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
            },
        });
        if (!order) {
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        if (!order.shipstationOrderId) {
            throw new ApiError_1.default(400, `Order ${orderId} does not have a ShipStation order ID`);
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
        const response = await axios_1.default.post(`${baseUrl}/orders/createlabelfororder`, labelRequest, {
            headers: getAuthHeader(),
            timeout: 30000,
        });
        await prisma_1.prisma.order.update({
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
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to create shipping label: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to create shipping label: ${error.message}`);
    }
};
const listOrders = async (params) => {
    try {
        return await makePaginatedRequest("/orders", params);
    }
    catch (error) {
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to list orders: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to list orders: ${error.message}`);
    }
};
const updateTracking = async (orderId, trackingNumber, carrier) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        // Update in database
        await prisma_1.prisma.order.update({
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
        const response = await axios_1.default.put(`${baseUrl}/orders/markasshipped`, updateData, {
            headers: getAuthHeader(),
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to update tracking: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to update tracking: ${error.message}`);
    }
};
// const markOrderAsShipped = async (orderId: string) => {
//     try {
//         const order = await prisma.order.findUnique({
//             where: { id: orderId },
//             include: {
//                 user: true,
//                 items: {
//                     include: {
//                         product: true,
//                     },
//                 },
//             },
//         });
//         if (!order) {
//             throw new ApiError(404, `Order ${orderId} not found`);
//         }
//         if (!order.shipstationOrderId) {
//             throw new ApiError(400, `Order ${orderId} does not have a ShipStation order ID. Create ShipStation order first.`);
//         }
//         // Update order status in database
//         await prisma.order.update({
//             where: { id: orderId },
//             data: {
//                 status: "SHIPPED",
//                 updatedAt: new Date(),
//             },
//         });
//         // Mark as shipped in ShipStation
//         const markShippedData = {
//             orderId: Number(order.shipstationOrderId),
//             notifyCustomer: true,
//             notifySalesChannel: true,
//         };
//         const response = await axios.put(`${baseUrl}/orders/markasshipped`, markShippedData, {
//             headers: getAuthHeader(),
//         });
//         // Send shipping confirmation email (using your existing pattern)
//         const emailData = {
//             id: order.id,
//             user: {
//                 name: order.user?.name || order.name,
//             },
//             shippingInfo: {
//                 name: order.name,
//                 address: order.address || "",
//                 city: order.city || "",
//                 state: order.state || "",
//                 zip: order.zip || "",
//             },
//             items: order.items.map((item) => ({
//                 name: item.product?.name || "Product",
//                 quantity: item.quantity,
//             })),
//             trackingNumber: order.trackingNumber || "TRACKING_PENDING",
//         };
//         const email = order.user?.email || order.email;
//         if (email) {
//             sendOrderShippedEmail(email, emailData).catch((error) => {
//                 console.error("❌ Shipping email failed:", error);
//             });
//         }
//         return response.data;
//     } catch (error: any) {
//         if (error instanceof ApiError) {
//             throw error;
//         }
//         if (error.response) {
//             throw new ApiError(error.response.status, `Failed to mark order as shipped: ${error.response.data?.message || error.message}`);
//         }
//         throw new ApiError(500, `Failed to mark order as shipped: ${error.message}`);
//     }
// };
const markOrderAsShipped = async (orderId) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
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
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        console.log(`DEBUG: Order ${orderId} found, status: ${order.status}, shipstationOrderId: ${order.shipstationOrderId}`);
        // Update order status in database
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: "SHIPPED",
                updatedAt: new Date(),
            },
        });
        console.log(`✅ Database updated to SHIPPED`);
        // Send shipping confirmation email
        const emailData = {
            id: order.id,
            user: {
                name: order.user?.name || order.name,
            },
            shippingInfo: {
                name: order.name,
                address: order.address || "",
                city: order.city || "",
                state: order.state || "",
                zip: order.zip || "",
            },
            items: order.items.map((item) => ({
                name: item.product?.name || "Product",
                quantity: item.quantity,
            })),
            trackingNumber: order.trackingNumber || "TRACKING_PENDING",
        };
        const email = order.user?.email || order.email;
        if (email) {
            console.log(`📧 Sending shipping email to: ${email}`);
            (0, orderEmailTemplate_1.sendOrderShippedEmail)(email, emailData).catch((error) => {
                console.error("❌ Shipping email failed:", error);
            });
        }
        return {
            success: true,
            message: "Order marked as shipped successfully",
            orderId: order.id,
            emailSent: !!email,
            note: "ShipStation integration skipped - order updated locally only",
        };
    }
    catch (error) {
        console.error(`❌ Error in markOrderAsShipped:`, error.message);
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(500, `Failed to mark order as shipped: ${error.message}`);
    }
};
const getCarriers = async () => {
    try {
        const response = await axios_1.default.get(`${baseUrl}/carriers`, {
            headers: getAuthHeader(),
        });
        return response.data;
    }
    catch (error) {
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to get carriers: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to get carriers: ${error.message}`);
    }
};
const getWarehouses = async () => {
    try {
        const response = await axios_1.default.get(`${baseUrl}/warehouses`, {
            headers: getAuthHeader(),
        });
        return response.data;
    }
    catch (error) {
        if (error.response) {
            throw new ApiError_1.default(error.response.status, `Failed to get warehouses: ${error.response.data?.message || error.message}`);
        }
        throw new ApiError_1.default(500, `Failed to get warehouses: ${error.message}`);
    }
};
// Add this function to your shipstation.service.ts
const markAsDelivered = async (orderId) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
            },
        });
        if (!order) {
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        // Update order status
        await prisma_1.prisma.order.update({
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
            (0, orderEmailTemplate_1.sendOrderDeliveredEmail)(email, emailData).catch((error) => {
                console.error("❌ Delivered email failed:", error);
            });
        }
        return {
            success: true,
            orderId,
            status: "DELIVERED",
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(500, `Failed to mark order as delivered: ${error.message}`);
    }
};
const cancelOrder = async (orderId) => {
    try {
        const order = await prisma_1.prisma.order.findUnique({
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
            throw new ApiError_1.default(404, `Order ${orderId} not found`);
        }
        // Only cancel if status is PENDING or PROCESSING
        if (!["PENDING", "PROCESSING"].includes(order.status)) {
            throw new ApiError_1.default(400, `Cannot cancel order with status: ${order.status}`);
        }
        // Update order status to CANCELLED
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
                updatedAt: new Date(),
            },
        });
        // Restore store credit if used
        if (order.creditApplied > 0) {
            await prisma_1.prisma.user.update({
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
            (0, orderEmailTemplate_1.sendOrderCancelledEmail)(email, emailData).catch((error) => {
                console.error("❌ Cancellation email failed:", error);
            });
        }
        return {
            success: true,
            orderId,
            status: "CANCELLED",
            storeCreditRestored: order.creditApplied,
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(500, `Failed to cancel order: ${error.message}`);
    }
};
exports.shipStationService = {
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
//# sourceMappingURL=shipstation.service.js.map