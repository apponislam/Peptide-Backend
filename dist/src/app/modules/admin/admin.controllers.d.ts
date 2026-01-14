import { Request, Response } from "express";
export declare const adminControllers: {
    adminLogin: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getDashboardStats: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllOrders: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateOrderStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllUsers: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=admin.controllers.d.ts.map