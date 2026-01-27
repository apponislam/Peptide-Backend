import axios from "axios";
import { prisma } from "../../../lib/prisma";
export class ShipStationService {
    baseUrl = "https://ssapi.shipstation.com";
    apiKey;
    apiSecret;
    constructor() {
        this.apiKey = process.env.SHIPSTATION_API_KEY;
        this.apiSecret = process.env.SHIPSTATION_API_SECRET;
    }
    getAuthHeader() {
        const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
        return {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
        };
    }
    async createOrder(orderId) {
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
                throw new Error(`Order ${orderId} not found`);
            }
            // Check if order has required fields
            if (!order.address || !order.city || !order.state || !order.zip || !order.country) {
                throw new Error(`Order ${orderId} is missing shipping address fields`);
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
            // console.log("ShipStation payload:", JSON.stringify(shipStationOrder, null, 2));
            // Add /v1/ to the endpoint
            const response = await axios.post(`${this.baseUrl}/orders/createorder`, shipStationOrder, {
                headers: this.getAuthHeader(),
                timeout: 30000,
            });
            // console.log("ShipStation response:", response.data);
            // Save ShipStation order ID
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    shipstationOrderId: response.data.orderId,
                    updatedAt: new Date(),
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation 400 Error Details:");
            console.error("URL:", `${this.baseUrl}/orders/createorder`);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Response data:", error.response.data);
                console.error("Headers:", error.response.headers);
            }
            else if (error.request) {
                console.error("No response received:", error.request);
            }
            else {
                console.error("Error message:", error.message);
            }
            throw new Error(`ShipStation Error: ${error.response?.data?.message || error.message}`);
        }
    }
    // Get shipping rates
    async getShippingRates(orderId) {
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
                throw new Error(`Order ${orderId} not found`);
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
            const response = await axios.post(`${this.baseUrl}/shipments/getrates`, rateRequest, { headers: this.getAuthHeader() });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation get rates error:", error.response?.data || error.message);
            throw new Error(`Failed to get shipping rates: ${error.message}`);
        }
    }
    // Create shipment label
    // async createLabel(orderId: string) {
    //     try {
    //         const order = await prisma.order.findUnique({
    //             where: { id: orderId },
    //         });
    //         if (!order) {
    //             throw new Error(`Order ${orderId} not found`);
    //         }
    //         const labelRequest = {
    //             orderId: orderId,
    //             carrierCode: "fedex",
    //             serviceCode: "fedex_ground",
    //             confirmation: "delivery",
    //             shipDate: new Date().toISOString().split("T")[0],
    //         };
    //         const response = await axios.post(`${this.baseUrl}/orders/createlabelfororder`, labelRequest, { headers: this.getAuthHeader() });
    //         await prisma.order.update({
    //             where: { id: orderId },
    //             data: {
    //                 labelUrl: response.data.labelUrl,
    //                 trackingNumber: response.data.trackingNumber,
    //             },
    //         });
    //         return response.data;
    //     } catch (error: any) {
    //         console.error("ShipStation create label error:", error.response?.data || error.message);
    //         throw new Error(`Failed to create shipping label: ${error.message}`);
    //     }
    // }
    async createLabel(orderId) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                },
            });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            if (!order.shipstationOrderId) {
                throw new Error(`Order ${orderId} does not have a ShipStation order ID.`);
            }
            // ✅ Your Static US Warehouse (Correct)
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
            // ✅ Your Customer's Address (From Database)
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
            // ✅ Build the label request
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
            console.log("Creating label with correct V1 payload:", JSON.stringify(labelRequest, null, 2));
            // 🔴 FIX: CALL THE CORRECT ENDPOINT
            const response = await axios.post(`${this.baseUrl}/orders/createlabelfororder`, // CHANGED ENDPOINT
            labelRequest, {
                headers: this.getAuthHeader(),
                timeout: 30000,
            });
            console.log("Label created successfully:", response.data);
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
        }
        catch (error) {
            console.error("ShipStation create label error details:");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", JSON.stringify(error.response.data, null, 2));
            }
            throw new Error(`Failed to create shipping label: ${error.message}`);
        }
    }
    // List orders from ShipStation
    async listOrders(params) {
        try {
            const response = await axios.get(`${this.baseUrl}/orders`, {
                headers: this.getAuthHeader(),
                params,
            });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation list orders error:", error.response?.data || error.message);
            throw new Error(`Failed to list orders: ${error.message}`);
        }
    }
    // ADD THESE MISSING METHODS:
    // Update tracking information
    async updateTracking(orderId, trackingNumber, carrier) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
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
            const response = await axios.put(`${this.baseUrl}/orders/markasshipped`, updateData, { headers: this.getAuthHeader() });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation update tracking error:", error.response?.data || error.message);
            throw new Error(`Failed to update tracking: ${error.message}`);
        }
    }
    // Mark order as shipped in ShipStation
    async markOrderAsShipped(orderId) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
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
            const response = await axios.post(`${this.baseUrl}/orders/markasshipped`, markShippedData, { headers: this.getAuthHeader() });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation mark as shipped error:", error.response?.data || error.message);
            throw new Error(`Failed to mark order as shipped: ${error.message}`);
        }
    }
    async getCarriers() {
        try {
            const response = await axios.get(`${this.baseUrl}/carriers`, {
                headers: this.getAuthHeader(),
            });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation get carriers error:", error.response?.data || error.message);
            throw new Error(`Failed to get carriers: ${error.message}`);
        }
    }
    async getWarehouses() {
        try {
            const response = await axios.get(`${this.baseUrl}/warehouses`, {
                headers: this.getAuthHeader(),
            });
            return response.data;
        }
        catch (error) {
            console.error("ShipStation get warehouses error:", error.response?.data || error.message);
            throw new Error(`Failed to get warehouses: ${error.message}`);
        }
    }
}
export const shipStationService = new ShipStationService();
//# sourceMappingURL=shipstation.service.js.map