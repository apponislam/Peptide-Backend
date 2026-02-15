"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const admin_controllers_1 = require("./admin.controllers");
const router = express_1.default.Router();
// Admin routes (protected - admin only)
router.get("/stats", auth_1.default, admin_controllers_1.adminControllers.getDashboardStats);
router.get("/orders", auth_1.default, admin_controllers_1.adminControllers.getAllOrders);
router.get("/orders/:id", auth_1.default, admin_controllers_1.adminControllers.getOrder);
router.get("/users", auth_1.default, admin_controllers_1.adminControllers.getAllUsers);
router.get("/users/:id", auth_1.default, admin_controllers_1.adminControllers.getUserById);
router.patch("/orders/:id", auth_1.default, admin_controllers_1.adminControllers.updateOrderStatus);
router.get("/top-products", auth_1.default, admin_controllers_1.adminControllers.getTopSellingProducts);
router.get("/referral-performance", auth_1.default, admin_controllers_1.adminControllers.getReferralPerformance);
router.patch("/users/:id", auth_1.default, admin_controllers_1.adminControllers.updateUser);
exports.adminRoutes = router;
//# sourceMappingURL=admin.routes.js.map