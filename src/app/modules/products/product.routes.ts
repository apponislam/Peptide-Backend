import express from "express";
import { productControllers } from "./product.controllers";
import auth from "../../middlewares/auth";
import upload from "../../middlewares/multer";

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

router.post("/demo-upload", upload.single("image"), (req, res) => {
    console.log("=== DEMO IMAGE UPLOAD ===");
    console.log("File info:", req.file);
    console.log("Body:", req.body);

    res.json({
        message: "Demo upload received",
        file: req.file,
        body: req.body,
    });
});

export const productRoutes = router;
