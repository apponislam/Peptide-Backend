import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { productRoutes } from "../modules/products/product.routes";
import { adminRoutes } from "../modules/admin/admin.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
