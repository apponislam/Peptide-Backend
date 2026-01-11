import express from "express";
import auth from "../../middlewares/auth";
import { adminControllers } from "./admin.controllers";

const router = express.Router();

// Admin login (public)
router.post("/login", adminControllers.adminLogin);

// Admin routes (protected - admin only)
router.get("/stats", auth, adminControllers.getDashboardStats);
router.get("/orders", auth, adminControllers.getAllOrders);
router.get("/users", auth, adminControllers.getAllUsers);
router.patch("/orders/:id", auth, adminControllers.updateOrderStatus);
router.patch("/users/:id", auth, adminControllers.updateUser);

export const adminRoutes = router;
