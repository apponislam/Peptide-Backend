"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentRoutes = void 0;
// src/routes/shipstation.routes.ts
const express_1 = __importDefault(require("express"));
const shipstation_controllers_1 = require("./shipstation.controllers");
const router = express_1.default.Router();
// ========== SHIPSTATION ROUTES ==========
router.post("/order/:orderId", shipstation_controllers_1.shipStationController.createOrder);
router.get("/rates/:orderId", shipstation_controllers_1.shipStationController.getShippingRates);
router.post("/label/:orderId", shipstation_controllers_1.shipStationController.createLabel);
router.get("/orders", shipstation_controllers_1.shipStationController.listOrders);
router.put("/tracking/:orderId", shipstation_controllers_1.shipStationController.updateTracking);
router.post("/ship/:orderId", shipstation_controllers_1.shipStationController.markAsShipped);
router.get("/carriers", shipstation_controllers_1.shipStationController.getCarriers);
router.get("/warehouses", shipstation_controllers_1.shipStationController.getWarehouses);
router.put("/delivered/:orderId", shipstation_controllers_1.shipStationController.markAsDelivered);
router.post("/order/:orderId/cancel", shipstation_controllers_1.shipStationController.cancelOrder);
exports.shipmentRoutes = router;
//# sourceMappingURL=shipstation.routes.js.map