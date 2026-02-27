import express from "express";
import { productControllers } from "./product.controllers";
import auth from "../../middlewares/auth";
import { uploadProductFiles } from "../../middlewares/multer";
// import { uploadAndCompress } from "../../middlewares/multer";

const router = express.Router();

// amdin routes
router.get("/admin", auth, productControllers.getAllProductsAdmin);
router.get("/admin/:id", auth, productControllers.getSingleProductAdmin);

router.post("/get-by-ids", productControllers.getProductsByIds);

// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getSingleProduct);

// Protected routes (admin only)
router.post("/", auth, uploadProductFiles, productControllers.createProduct);
router.patch("/:id", auth, uploadProductFiles, productControllers.updateProduct);
router.patch("/:id/remove", auth, productControllers.removeProductItem);
router.delete("/:id", auth, productControllers.deleteProduct);

// Admin only - manage deleted products
// router.get("/admin", auth, productControllers.getAllProductsAdmin);
// router.get("/admin/:id", auth, productControllers.getSingleProductAdmin);
router.get("/admin/deleted", auth, productControllers.getDeletedProducts);
router.patch("/admin/restore/:id", auth, productControllers.restoreProduct);
router.patch("/admin/toggle-stock/:id", auth, productControllers.toggleProductStock);

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

export const productRoutes = router;
