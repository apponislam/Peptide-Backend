import { Request, Response } from "express";
export declare class PaymentController {
    static createCheckoutSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createPaymentIntent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createRefund(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSessionStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=payment.controller.d.ts.map