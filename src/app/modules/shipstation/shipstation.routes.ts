// src/routes/shipstation.routes.ts
import express from "express";
import { ShipStationController } from "./shipstation.controllers";

const router = express.Router();

// ========== SHIPSTATION ROUTES ==========
router.post("/order/:orderId", ShipStationController.createOrder);
router.get("/rates/:orderId", ShipStationController.getShippingRates);
router.post("/label/:orderId", ShipStationController.createLabel);
router.get("/orders", ShipStationController.listOrders);
router.put("/tracking/:orderId", ShipStationController.updateTracking);
router.post("/ship/:orderId", ShipStationController.markAsShipped);
router.get("/carriers", ShipStationController.getCarriers);

export const shipmentRoutes = router;
