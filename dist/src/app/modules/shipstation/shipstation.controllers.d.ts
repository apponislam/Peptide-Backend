import { Request, Response } from "express";
export declare class ShipStationController {
    static createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getShippingRates(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createLabel(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static listOrders(req: Request, res: Response): Promise<void>;
    static updateTracking(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static markAsShipped(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCarriers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=shipstation.controllers.d.ts.map