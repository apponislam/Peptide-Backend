"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = require("../../lib/prisma");
const auth = (0, catchAsync_1.default)(async (req, res, next) => {
    let token = req.headers.authorization;
    if (token?.startsWith("Bearer "))
        token = token.slice(7);
    if (!token) {
        throw new ApiError_1.default(401, "Authentication failed: No token provided");
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError_1.default(401, "Authentication failed: Token expired");
        }
        throw new ApiError_1.default(401, "Authentication failed: Invalid token");
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            email: true,
            tier: true,
            storeCredit: true,
            referralCount: true,
            referralCode: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "Authentication failed: User not found");
    }
    // Attach user to request object
    req.user = user;
    next();
});
exports.default = auth;
//# sourceMappingURL=auth.js.map