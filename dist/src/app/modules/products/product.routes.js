"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controllers_1 = require("./product.controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multer_1 = require("../../middlewares/multer");
// import { uploadAndCompress } from "../../middlewares/multer";
const router = express_1.default.Router();
// amdin routes
router.get("/admin", auth_1.default, product_controllers_1.productControllers.getAllProductsAdmin);
router.get("/admin/:id", auth_1.default, product_controllers_1.productControllers.getSingleProductAdmin);
router.post("/get-by-ids", product_controllers_1.productControllers.getProductsByIds);
// Public routes
router.get("/", product_controllers_1.productControllers.getAllProducts);
router.get("/:id", product_controllers_1.productControllers.getSingleProduct);
// Protected routes (admin only)
router.post("/", auth_1.default, multer_1.uploadProductFiles, product_controllers_1.productControllers.createProduct);
router.patch("/:id", auth_1.default, multer_1.uploadProductFiles, product_controllers_1.productControllers.updateProduct);
router.delete("/:id", auth_1.default, product_controllers_1.productControllers.deleteProduct);
// Admin only - manage deleted products
// router.get("/admin", auth, productControllers.getAllProductsAdmin);
// router.get("/admin/:id", auth, productControllers.getSingleProductAdmin);
router.get("/admin/deleted", auth_1.default, product_controllers_1.productControllers.getDeletedProducts);
router.patch("/admin/restore/:id", auth_1.default, product_controllers_1.productControllers.restoreProduct);
router.patch("/admin/toggle-stock/:id", auth_1.default, product_controllers_1.productControllers.toggleProductStock);
// router.post("/demo-upload", uploadAndCompress, (req, res) => {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });
//     res.json({
//         message: "Image uploaded & compressed successfully!",
//         file: {
//             filename: req.file.filename,
//             url: `/uploads/product-images/${req.file.filename}`,
//             mimetype: req.file.mimetype,
//             size: req.file.size,
//         },
//     });
// });
exports.productRoutes = router;
//# sourceMappingURL=product.routes.js.map