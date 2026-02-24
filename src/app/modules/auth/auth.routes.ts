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

router.patch("/update-referral-code", auth, authControllers.updateReferralCode);
router.get("/check-referral-code/:code", authControllers.checkReferralCode);

// Password reset routes
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/verify-otp", authControllers.verifyOTP);
router.post("/reset-password", authControllers.resetPassword);

//Get user referrals with pagination
router.get("/my-referrals", auth, authControllers.getMyReferrals);
router.patch("/update-profile", auth, authControllers.updateProfile);
router.patch("/change-password", auth, authControllers.changePassword);

// Admin

router.post("/admin/login", authControllers.adminLogin);

export const authRoutes = router;
