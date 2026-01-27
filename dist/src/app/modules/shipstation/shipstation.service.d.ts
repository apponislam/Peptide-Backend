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
export declare class ShipStationService {
    private baseUrl;
    private apiKey;
    private apiSecret;
    constructor();
    private getAuthHeader;
    createOrder(orderId: string): Promise<any>;
    getShippingRates(orderId: string): Promise<any>;
    createLabel(orderId: string): Promise<any>;
    listOrders(params?: any): Promise<any>;
    updateTracking(orderId: string, trackingNumber: string, carrier: string): Promise<any>;
    markOrderAsShipped(orderId: string): Promise<any>;
    getCarriers(): Promise<any>;
    getWarehouses(): Promise<any>;
}
export declare const shipStationService: ShipStationService;
//# sourceMappingURL=shipstation.service.d.ts.map