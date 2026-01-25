import express from "express";
import { productControllers } from "./product.controllers";
import auth from "../../middlewares/auth";
const router = express.Router();
// // Public routes
// router.get("/", productControllers.getAllProducts);
// router.get("/:id", productControllers.getSingleProduct);
// // Admin/Create routes
// router.post("/", productControllers.createProduct);
// router.put("/:id", productControllers.updateProduct);
// router.delete("/:id", productControllers.deleteProduct);
// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getSingleProduct);
// Protected routes (admin only)
router.post("/", auth, productControllers.createProduct);
router.patch("/:id", auth, productControllers.updateProduct);
router.delete("/:id", auth, productControllers.deleteProduct);
// Admin only - manage deleted products
router.get("/admin/deleted", auth, productControllers.getDeletedProducts);
router.patch("/admin/restore/:id", auth, productControllers.restoreProduct);
export const productRoutes = router;
//# sourceMappingURL=product.routes.js.map