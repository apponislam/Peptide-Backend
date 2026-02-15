import express from "express";
import { productControllers } from "./product.controllers";
import auth from "../../middlewares/auth";
import { uploadAndCompress } from "../../middlewares/multer";

const router = express.Router();

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

router.post("/demo-upload", uploadAndCompress, (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    res.json({
        message: "Image uploaded & compressed successfully!",
        file: {
            filename: req.file.filename,
            url: `/uploads/product-images/${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
        },
    });
});

export const productRoutes = router;
