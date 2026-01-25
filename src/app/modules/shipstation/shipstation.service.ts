// // src/services/shipstation.service.ts
// import axios from "axios";
// import { prisma } from "../../../lib/prisma";

// export interface ShipStationOrderItem {
//     lineItemKey: string;
//     sku: string;
//     name: string;
//     quantity: number;
//     unitPrice: number;
//     weight?: {
//         value: number;
//         units: string;
//     };
// }

// export interface ShipStationAddress {
//     name: string;
//     company?: string;
//     street1: string;
//     street2?: string;
//     street3?: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country: string;
//     phone: string;
// }

// export interface ShipStationOrder {
//     orderNumber: string;
//     orderDate: string;
//     orderStatus: "awaiting_payment" | "awaiting_shipment" | "shipped" | "cancelled";
//     billTo: ShipStationAddress;
//     shipTo: ShipStationAddress;
//     items: ShipStationOrderItem[];
//     amountPaid: number;
//     shippingAmount: number;
//     customerNotes?: string;
// }

// export class ShipStationService {
//     private baseUrl = "https://ssapi.shipstation.com";
//     private apiKey: string;
//     private apiSecret: string;

//     constructor() {
//         this.apiKey = process.env.SHIPSTATION_API_KEY!;
//         this.apiSecret = process.env.SHIPSTATION_API_SECRET!;
//     }

//     private getAuthHeader() {
//         const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
//         return {
//             Authorization: `Basic ${auth}`,
//             "Content-Type": "application/json",
//         };
//     }

//     // Create order in ShipStation
//     async createOrder(orderId: string) {
//         try {
//             // Get order details from database
//             const order = await prisma.order.findUnique({
//                 where: { id: orderId },
//                 include: {
//                     items: {
//                         include: {
//                             product: true,
//                         },
//                     },
//                     user: true,
//                 },
//             });

//             if (!order) {
//                 throw new Error(`Order ${orderId} not found`);
//             }

//             // Convert to ShipStation format
//             const shipStationOrder: ShipStationOrder = {
//                 orderNumber: order.id,
//                 orderDate: order.createdAt.toISOString(),
//                 orderStatus: "awaiting_shipment",
//                 billTo: {
//                     name: order.name,
//                     street1: order.address,
//                     city: order.city,
//                     state: order.state,
//                     postalCode: order.zip,
//                     country: order.country,
//                     phone: order.phone,
//                 },
//                 shipTo: {
//                     name: order.name,
//                     street1: order.address,
//                     city: order.city,
//                     state: order.state,
//                     postalCode: order.zip,
//                     country: order.country,
//                     phone: order.phone,
//                 },
//                 items: order.items.map((item) => ({
//                     lineItemKey: item.id,
//                     sku: `PROD-${item.productId}`,
//                     name: item.product?.name || "Unknown Product",
//                     quantity: item.quantity,
//                     unitPrice: item.unitPrice,
//                     weight: {
//                         value: 1, // Default weight, should come from product
//                         units: "pounds",
//                     },
//                 })),
//                 amountPaid: order.total,
//                 shippingAmount: order.shipping,
//             };

//             const response = await axios.post(`${this.baseUrl}/orders/createorder`, shipStationOrder, { headers: this.getAuthHeader() });

//             // Update order with ShipStation info
//             await prisma.order.update({
//                 where: { id: orderId },
//                 data: {
//                     trackingNumber: response.data.trackingNumber || null,
//                     labelUrl: response.data.labelUrl || null,
//                 },
//             });

//             return response.data;
//         } catch (error: any) {
//             console.error("ShipStation create order error:", error.response?.data || error.message);
//             throw new Error(`Failed to create ShipStation order: ${error.message}`);
//         }
//     }

//     // Get shipping rates
//     async getShippingRates(orderId: string) {
//         try {
//             const order = await prisma.order.findUnique({
//                 where: { id: orderId },
//                 include: {
//                     items: {
//                         include: {
//                             product: true,
//                         },
//                     },
//                 },
//             });

//             if (!order) {
//                 throw new Error(`Order ${orderId} not found`);
//             }

//             // Create rate request
//             const rateRequest = {
//                 carrierCode: "fedex", // or 'ups', 'usps', etc.
//                 serviceCode: "fedex_ground",
//                 packageCode: "package",
//                 fromPostalCode: "90210", // Your warehouse zip
//                 toState: order.state,
//                 toCountry: order.country,
//                 toPostalCode: order.zip,
//                 weight: {
//                     value: 5, // Calculate based on products
//                     units: "pounds",
//                 },
//                 dimensions: {
//                     units: "inches",
//                     length: 10,
//                     width: 10,
//                     height: 10,
//                 },
//                 confirmation: "delivery",
//                 residential: true,
//             };

//             const response = await axios.post(`${this.baseUrl}/shipments/getrates`, rateRequest, { headers: this.getAuthHeader() });

//             return response.data;
//         } catch (error: any) {
//             console.error("ShipStation get rates error:", error.response?.data || error.message);
//             throw new Error(`Failed to get shipping rates: ${error.message}`);
//         }
//     }

//     // Create shipment label
//     async createLabel(orderId: string) {
//         try {
//             const order = await prisma.order.findUnique({
//                 where: { id: orderId },
//             });

//             if (!order) {
//                 throw new Error(`Order ${orderId} not found`);
//             }

//             const labelRequest = {
//                 orderId: orderId,
//                 carrierCode: "fedex",
//                 serviceCode: "fedex_ground",
//                 confirmation: "delivery",
//                 shipDate: new Date().toISOString().split("T")[0],
//             };

//             const response = await axios.post(`${this.baseUrl}/orders/createlabelfororder`, labelRequest, { headers: this.getAuthHeader() });

//             // Update order with label URL
//             await prisma.order.update({
//                 where: { id: orderId },
//                 data: {
//                     labelUrl: response.data.labelUrl,
//                     trackingNumber: response.data.trackingNumber,
//                 },
//             });

//             return response.data;
//         } catch (error: any) {
//             console.error("ShipStation create label error:", error.response?.data || error.message);
//             throw new Error(`Failed to create shipping label: ${error.message}`);
//         }
//     }

//     // List orders from ShipStation
//     async listOrders(params?: any) {
//         try {
//             const response = await axios.get(`${this.baseUrl}/orders`, {
//                 headers: this.getAuthHeader(),
//                 params,
//             });
//             return response.data;
//         } catch (error: any) {
//             console.error("ShipStation list orders error:", error.response?.data || error.message);
//             throw new Error(`Failed to list orders: ${error.message}`);
//         }
//     }
// }

// export const shipStationService = new ShipStationService();

// src/services/shipstation.service.ts
import axios from "axios";
import { prisma } from "../../../lib/prisma";

export interface ShipStationOrderItem {
    lineItemKey: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    weight?: {
        value: number;
        units: string;
    };
}

export interface ShipStationAddress {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    street3?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
}

export interface ShipStationOrder {
    orderNumber: string;
    orderDate: string;
    orderStatus: "awaiting_payment" | "awaiting_shipment" | "shipped" | "cancelled";
    billTo: ShipStationAddress;
    shipTo: ShipStationAddress;
    items: ShipStationOrderItem[];
    amountPaid: number;
    shippingAmount: number;
    customerNotes?: string;
}

export class ShipStationService {
    private baseUrl = "https://ssapi.shipstation.com";
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.apiKey = process.env.SHIPSTATION_API_KEY!;
        this.apiSecret = process.env.SHIPSTATION_API_SECRET!;
    }

    private getAuthHeader() {
        const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
        return {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
        };
    }

    // Create order in ShipStation
    async createOrder(orderId: string) {
        try {
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

            const shipStationOrder: ShipStationOrder = {
                orderNumber: order.id,
                orderDate: order.createdAt.toISOString(),
                orderStatus: "awaiting_shipment",
                billTo: {
                    name: order.name,
                    street1: order.address,
                    city: order.city,
                    state: order.state,
                    postalCode: order.zip,
                    country: order.country,
                    phone: order.phone,
                },
                shipTo: {
                    name: order.name,
                    street1: order.address,
                    city: order.city,
                    state: order.state,
                    postalCode: order.zip,
                    country: order.country,
                    phone: order.phone,
                },
                items: order.items.map((item) => ({
                    lineItemKey: item.id,
                    sku: `PROD-${item.productId}`,
                    name: item.product?.name || "Unknown Product",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    weight: {
                        value: 1,
                        units: "pounds",
                    },
                })),
                amountPaid: order.total,
                shippingAmount: order.shipping,
            };

            const response = await axios.post(`${this.baseUrl}/orders/createorder`, shipStationOrder, { headers: this.getAuthHeader() });

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    trackingNumber: response.data.trackingNumber || null,
                    labelUrl: response.data.labelUrl || null,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error("ShipStation create order error:", error.response?.data || error.message);
            throw new Error(`Failed to create ShipStation order: ${error.message}`);
        }
    }

    // Get shipping rates
    async getShippingRates(orderId: string) {
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
        } catch (error: any) {
            console.error("ShipStation get rates error:", error.response?.data || error.message);
            throw new Error(`Failed to get shipping rates: ${error.message}`);
        }
    }

    // Create shipment label
    async createLabel(orderId: string) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }

            const labelRequest = {
                orderId: orderId,
                carrierCode: "fedex",
                serviceCode: "fedex_ground",
                confirmation: "delivery",
                shipDate: new Date().toISOString().split("T")[0],
            };

            const response = await axios.post(`${this.baseUrl}/orders/createlabelfororder`, labelRequest, { headers: this.getAuthHeader() });

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    labelUrl: response.data.labelUrl,
                    trackingNumber: response.data.trackingNumber,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error("ShipStation create label error:", error.response?.data || error.message);
            throw new Error(`Failed to create shipping label: ${error.message}`);
        }
    }

    // List orders from ShipStation
    async listOrders(params?: any) {
        try {
            const response = await axios.get(`${this.baseUrl}/orders`, {
                headers: this.getAuthHeader(),
                params,
            });
            return response.data;
        } catch (error: any) {
            console.error("ShipStation list orders error:", error.response?.data || error.message);
            throw new Error(`Failed to list orders: ${error.message}`);
        }
    }

    // ADD THESE MISSING METHODS:

    // Update tracking information
    async updateTracking(orderId: string, trackingNumber: string, carrier: string) {
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
        } catch (error: any) {
            console.error("ShipStation update tracking error:", error.response?.data || error.message);
            throw new Error(`Failed to update tracking: ${error.message}`);
        }
    }

    // Mark order as shipped in ShipStation
    async markOrderAsShipped(orderId: string) {
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
        } catch (error: any) {
            console.error("ShipStation mark as shipped error:", error.response?.data || error.message);
            throw new Error(`Failed to mark order as shipped: ${error.message}`);
        }
    }
}

export const shipStationService = new ShipStationService();
