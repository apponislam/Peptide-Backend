import express from "express";
import auth from "../../middlewares/auth";
import { authControllers } from "./auth.controllers";

const router = express.Router();

// Public routes
router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.post("/refresh-token", authControllers.refreshAccessToken);
router.post("/logout", authControllers.logout);
router.get("/me", auth, authControllers.getCurrentUser);

export const authRoutes = router;
