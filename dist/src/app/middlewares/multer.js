"use strict";
// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import fs from "fs";
// import { Request, Response, NextFunction } from "express";
// import sharp from "sharp";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductFiles = void 0;
// // Ensure uploads/product-images exists
// const uploadDir = path.join(process.cwd(), "uploads", "product-images");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
// // Multer memory storage (so we can compress before saving)
// const storage = multer.memoryStorage();
// const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//     if (allowedTypes.includes(file.mimetype)) cb(null, true);
//     else cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
// };
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 10 * 1024 * 1024 },
// });
// // Single middleware function
// export const uploadAndCompress = async (req: Request, res: Response, next: NextFunction) => {
//     // Use Multer single upload first
//     const singleUpload = upload.single("image");
//     singleUpload(req, res, async function (err) {
//         if (err) return next(err);
//         if (!req.file) return next();
//         try {
//             const timestamp = Date.now().toString().slice(-6);
//             const randomNum = Math.floor(Math.random() * 10000);
//             const ext = path.extname(req.file.originalname);
//             const newName = `product-${timestamp}-${randomNum}${ext}`;
//             const outputPath = path.join(uploadDir, newName);
//             // Compress to webp (keep original dimensions)
//             await sharp(req.file.buffer).webp({ quality: 80 }).toFile(outputPath);
//             // Replace file info for next middleware
//             req.file.filename = newName;
//             req.file.path = outputPath;
//             req.file.mimetype = "image/webp";
//             next();
//         } catch (error) {
//             next(error);
//         }
//     });
// };
// middlewares/multer.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Ensure upload directories exist
const productImageDir = path_1.default.join(process.cwd(), "uploads", "product-images");
const coaDir = path_1.default.join(process.cwd(), "uploads", "coa");
if (!fs_1.default.existsSync(productImageDir))
    fs_1.default.mkdirSync(productImageDir, { recursive: true });
if (!fs_1.default.existsSync(coaDir))
    fs_1.default.mkdirSync(coaDir, { recursive: true });
// Multer memory storage
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    if (file.fieldname === "image") {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error("Product image must be JPG, PNG, or WEBP"));
    }
    else if (file.fieldname === "coa") {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (allowedTypes.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error("COA must be JPG, PNG, WEBP, or PDF"));
    }
    else {
        cb(new Error("Invalid field name"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
// Middleware for multiple file uploads
const uploadProductFiles = async (req, res, next) => {
    // Use Multer fields upload
    const fieldsUpload = upload.fields([
        { name: "image", maxCount: 1 },
        { name: "coa", maxCount: 1 },
    ]);
    fieldsUpload(req, res, async function (err) {
        if (err)
            return next(err);
        const files = req.files;
        try {
            // Process product image (compress to webp)
            if (files?.image?.[0]) {
                const imageFile = files.image[0];
                const timestamp = Date.now().toString().slice(-6);
                const randomNum = Math.floor(Math.random() * 10000);
                const newName = `product-${timestamp}-${randomNum}.webp`;
                const outputPath = path_1.default.join(productImageDir, newName);
                await (0, sharp_1.default)(imageFile.buffer).webp({ quality: 80 }).toFile(outputPath);
                // Update file info
                imageFile.filename = newName;
                imageFile.path = outputPath;
                imageFile.mimetype = "image/webp";
            }
            // Process COA file
            if (files?.coa?.[0]) {
                const coaFile = files.coa[0];
                const timestamp = Date.now().toString().slice(-6);
                const randomNum = Math.floor(Math.random() * 10000);
                const ext = path_1.default.extname(coaFile.originalname);
                let newName;
                let outputPath;
                // If it's an image, compress to webp
                if (coaFile.mimetype.startsWith("image/")) {
                    newName = `coa-${timestamp}-${randomNum}.webp`;
                    outputPath = path_1.default.join(coaDir, newName);
                    await (0, sharp_1.default)(coaFile.buffer).webp({ quality: 80 }).toFile(outputPath);
                    coaFile.mimetype = "image/webp";
                }
                // If it's PDF, save as is
                else {
                    newName = `coa-${timestamp}-${randomNum}${ext}`;
                    outputPath = path_1.default.join(coaDir, newName);
                    fs_1.default.writeFileSync(outputPath, coaFile.buffer);
                }
                // Update file info
                coaFile.filename = newName;
                coaFile.path = outputPath;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.uploadProductFiles = uploadProductFiles;
//# sourceMappingURL=multer.js.map