export declare const shipStationService: {
    createOrder: (orderId: string) => Promise<any>;
    getShippingRates: (orderId: string) => Promise<any>;
    createLabel: (orderId: string) => Promise<any>;
    listOrders: (params?: any) => Promise<any>;
    updateTracking: (orderId: string, trackingNumber: string, carrier: string) => Promise<any>;
    markOrderAsShipped: (orderId: string) => Promise<{
        success: boolean;
        message: string;
        orderId: string;
        emailSent: boolean;
        note: string;
    }>;
    getCarriers: () => Promise<any>;
    getWarehouses: () => Promise<any>;
    markAsDelivered: (orderId: string) => Promise<{
        success: boolean;
        orderId: string;
        status: string;
    }>;
    cancelOrder: (orderId: string) => Promise<{
        success: boolean;
        orderId: string;
        status: string;
        storeCreditRestored: number;
    }>;
};
//# sourceMappingURL=shipstation.service.d.ts.map