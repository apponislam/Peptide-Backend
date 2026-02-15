"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const orders_controllers_1 = require("./orders.controllers");
const router = express_1.default.Router();
// Order routes (protected)
router.get("/:orderId", auth_1.default, orders_controllers_1.orderControllers.getOrder);
router.get("/", auth_1.default, orders_controllers_1.orderControllers.getOrders);
exports.orderRoutes = router;
//# sourceMappingURL=orders.routes.js.map