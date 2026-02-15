"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controllers_1 = require("./product.controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// Public routes
router.get("/", product_controllers_1.productControllers.getAllProducts);
router.get("/:id", product_controllers_1.productControllers.getSingleProduct);
// Protected routes (admin only)
router.post("/", auth_1.default, product_controllers_1.productControllers.createProduct);
router.patch("/:id", auth_1.default, product_controllers_1.productControllers.updateProduct);
router.delete("/:id", auth_1.default, product_controllers_1.productControllers.deleteProduct);
// Admin only - manage deleted products
router.get("/admin/deleted", auth_1.default, product_controllers_1.productControllers.getDeletedProducts);
router.patch("/admin/restore/:id", auth_1.default, product_controllers_1.productControllers.restoreProduct);
exports.productRoutes = router;
//# sourceMappingURL=product.routes.js.map