import express from "express";
import { authController } from "./auth.controllers";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.getCurrentUser);

export const authRoutes = router;
