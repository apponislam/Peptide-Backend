import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ensure uploads/product-images directory exists
const uploadDir = path.join(process.cwd(), "uploads", "product-images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        // Generate clean random name
        const timestamp = Date.now().toString().slice(-6); // last 6 digits
        const randomNum = Math.floor(Math.random() * 10000); // 0-9999
        const ext = path.extname(file.originalname);

        const newName = `product-${timestamp}-${randomNum}${ext}`;
        cb(null, newName);
    },
});

// File filter (only images allowed)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
