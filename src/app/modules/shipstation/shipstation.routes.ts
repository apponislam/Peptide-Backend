// src/routes/shipstation.routes.ts
import express from "express";
import { shipStationController } from "./shipstation.controllers";

const router = express.Router();

// ========== SHIPSTATION ROUTES ==========
router.post("/order/:orderId", shipStationController.createOrder);
router.get("/rates/:orderId", shipStationController.getShippingRates);
router.post("/label/:orderId", shipStationController.createLabel);
router.get("/orders", shipStationController.listOrders);
router.put("/tracking/:orderId", shipStationController.updateTracking);
router.post("/ship/:orderId", shipStationController.markAsShipped);
router.get("/carriers", shipStationController.getCarriers);
router.get("/warehouses", shipStationController.getWarehouses);

router.put("/delivered/:orderId", shipStationController.markAsDelivered);
router.post("/order/:orderId/cancel", shipStationController.cancelOrder);

export const shipmentRoutes = router;
