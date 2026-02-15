"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_controllers_1 = require("./auth.controllers");
const router = express_1.default.Router();
// Public routes
router.post("/register", auth_controllers_1.authControllers.register);
router.post("/login", auth_controllers_1.authControllers.login);
router.post("/refresh-token", auth_controllers_1.authControllers.refreshAccessToken);
router.post("/logout", auth_controllers_1.authControllers.logout);
router.get("/me", auth_1.default, auth_controllers_1.authControllers.getCurrentUser);
router.patch("/update-referral-code", auth_1.default, auth_controllers_1.authControllers.updateReferralCode);
router.get("/check-referral-code/:code", auth_controllers_1.authControllers.checkReferralCode);
// Admin
router.post("/admin/login", auth_controllers_1.authControllers.adminLogin);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map