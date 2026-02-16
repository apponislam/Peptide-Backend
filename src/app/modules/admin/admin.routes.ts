import express from "express";
import auth from "../../middlewares/auth";
import { adminControllers } from "./admin.controllers";

const router = express.Router();

// Admin routes (protected - admin only)
router.get("/stats", auth, adminControllers.getDashboardStats);
router.get("/orders", auth, adminControllers.getAllOrders);
router.get("/orders/:id", auth, adminControllers.getOrder);
router.get("/users", auth, adminControllers.getAllUsers);
router.get("/users/:id", auth, adminControllers.getUserById);
router.patch("/orders/:id", auth, adminControllers.updateOrderStatus);
router.patch("/users/:id", auth, adminControllers.updateUser);
router.get("/top-products", auth, adminControllers.getTopSellingProducts);
router.get("/referral-performance", auth, adminControllers.getReferralPerformance);

export const adminRoutes = router;
