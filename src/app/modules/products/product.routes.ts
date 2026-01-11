import express from "express";
import { productControllers } from "./product.controllers";

const router = express.Router();

// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getSingleProduct);

// Admin/Create routes
router.post("/", productControllers.createProduct);
router.put("/:id", productControllers.updateProduct);
router.delete("/:id", productControllers.deleteProduct);

export const productRoutes = router;
