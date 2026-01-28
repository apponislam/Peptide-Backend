import express from "express";
import auth from "../../middlewares/auth";
import { orderControllers } from "./orders.controllers";

const router = express.Router();

// Order routes (protected)
router.get("/:orderId", auth, orderControllers.getOrder);
router.get("/", auth, orderControllers.getOrders);

export const orderRoutes = router;
