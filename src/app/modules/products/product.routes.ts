import express from "express";
import { productControllers } from "./product.controllers";

const router = express.Router();

// Public routes
router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getSingleProduct);

export const productRoutes = router;
