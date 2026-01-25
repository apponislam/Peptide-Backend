import { Request, Response } from "express";
export declare const productControllers: {
    createProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllProducts: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getSingleProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getDeletedProducts: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    restoreProduct: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=product.controllers.d.ts.map