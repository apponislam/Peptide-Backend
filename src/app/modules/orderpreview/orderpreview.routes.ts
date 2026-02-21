import express from "express";
import auth from "../../middlewares/auth";
import { orderPreviewControllers } from "./orderpreview.controllers";

const router = express.Router();

// Order Preview routes (protected)
router.post("/", auth, orderPreviewControllers.createOrderPreview);
router.get("/:previewId", auth, orderPreviewControllers.getOrderPreview);
router.delete("/:previewId", auth, orderPreviewControllers.deleteOrderPreview);

export const orderPreviewRoutes = router;
