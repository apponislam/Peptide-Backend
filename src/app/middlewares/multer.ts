// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import fs from "fs";
// import { Request } from "express";

// // Ensure uploads/product-images directory exists
// const uploadDir = path.join(process.cwd(), "uploads", "product-images");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//     destination: (_req: Request, _file: Express.Multer.File, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (_req: Request, file: Express.Multer.File, cb) => {
//         // Generate clean random name
//         const timestamp = Date.now().toString().slice(-6); // last 6 digits
//         const randomNum = Math.floor(Math.random() * 10000); // 0-9999
//         const ext = path.extname(file.originalname);

//         const newName = `product-${timestamp}-${randomNum}${ext}`;
//         cb(null, newName);
//     },
// });

// // File filter (only images allowed)
// const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//     if (allowedTypes.includes(file.mimetype)) cb(null, true);
//     else cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 },
// });

// export default upload;

import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

// Ensure uploads/product-images exists
const uploadDir = path.join(process.cwd(), "uploads", "product-images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer memory storage (so we can compress before saving)
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

// Single middleware function
export const uploadAndCompress = async (req: Request, res: Response, next: NextFunction) => {
    // Use Multer single upload first
    const singleUpload = upload.single("image");

    singleUpload(req, res, async function (err) {
        if (err) return next(err);
        if (!req.file) return next();

        try {
            const timestamp = Date.now().toString().slice(-6);
            const randomNum = Math.floor(Math.random() * 10000);
            const ext = path.extname(req.file.originalname);

            const newName = `product-${timestamp}-${randomNum}${ext}`;
            const outputPath = path.join(uploadDir, newName);

            // Compress to webp (keep original dimensions)
            await sharp(req.file.buffer).webp({ quality: 80 }).toFile(outputPath);

            // Replace file info for next middleware
            req.file.filename = newName;
            req.file.path = outputPath;
            req.file.mimetype = "image/webp";

            next();
        } catch (error) {
            next(error);
        }
    });
};
