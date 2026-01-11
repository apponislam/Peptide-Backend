import { Request, Response } from "express";
import { authService } from "./auth.services";

export const authController = {
    async register(req: Request, res: Response) {
        try {
            const { email, password, referralCode } = req.body;
            const result = await authService.register(email, password, referralCode);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    },

    async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const user = await authService.getCurrentUser(userId);
            res.json(user);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    },
};
