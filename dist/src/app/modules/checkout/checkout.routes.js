import express from "express";
import { checkoutControllers } from "./checkout.controllers";
const router = express.Router();
router.post("/create-session", checkoutControllers.createCheckoutSession);
router.get("/verify-session/:sessionId", checkoutControllers.verifySession);
export const checkoutRoutes = router;
//# sourceMappingURL=checkout.routes.js.map