import { Request, Response } from "express";
export declare const authControllers: {
    register: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getCurrentUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    refreshAccessToken: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateReferralCode: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    checkReferralCode: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    adminLogin: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=auth.controllers.d.ts.map