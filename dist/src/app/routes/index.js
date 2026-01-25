import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { productRoutes } from "../modules/products/product.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { shipmentRoutes } from "../modules/shipstation/shipstation.routes";
const router = express.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/products",
        route: productRoutes,
    },
    {
        path: "/admin",
        route: adminRoutes,
    },
    {
        path: "/payment",
        route: paymentRoutes,
    },
    {
        path: "/shipment",
        route: shipmentRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
//# sourceMappingURL=index.js.map