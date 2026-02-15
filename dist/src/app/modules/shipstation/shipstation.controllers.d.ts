import { Request, Response } from "express";
export declare const shipStationController: {
    createOrder: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getShippingRates: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    createLabel: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    listOrders: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateTracking: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    markAsShipped: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getCarriers: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getWarehouses: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    markAsDelivered: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    cancelOrder: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=shipstation.controllers.d.ts.map