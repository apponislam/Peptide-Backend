import express from "express";
import auth from "../../middlewares/auth";
import { referralControllers } from "./referral.controllers";

const router = express.Router();

router.get("/stats", auth, referralControllers.getReferralStats);

export const referralRoutes = router;
