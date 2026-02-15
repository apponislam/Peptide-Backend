"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const product_routes_1 = require("../modules/products/product.routes");
const admin_routes_1 = require("../modules/admin/admin.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const shipstation_routes_1 = require("../modules/shipstation/shipstation.routes");
const orders_routes_1 = require("../modules/orders/orders.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRoutes,
    },
    {
        path: "/products",
        route: product_routes_1.productRoutes,
    },
    {
        path: "/admin",
        route: admin_routes_1.adminRoutes,
    },
    {
        path: "/payment",
        route: payment_routes_1.paymentRoutes,
    },
    {
        path: "/shipment",
        route: shipstation_routes_1.shipmentRoutes,
    },
    {
        path: "/orders",
        route: orders_routes_1.orderRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
//# sourceMappingURL=index.js.map