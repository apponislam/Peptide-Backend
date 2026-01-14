import jwt from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../lib/prisma";
const auth = catchAsync(async (req, res, next) => {
    let token = req.headers.authorization;
    if (token?.startsWith("Bearer "))
        token = token.slice(7);
    if (!token) {
        throw new ApiError(401, "Authentication failed: No token provided");
    }
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt_access_secret);
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Authentication failed: Token expired");
        }
        throw new ApiError(401, "Authentication failed: Invalid token");
    }
    const user = await prisma.user.findUnique({
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
        throw new ApiError(404, "Authentication failed: User not found");
    }
    // Attach user to request object
    req.user = user;
    next();
});
export default auth;
//# sourceMappingURL=auth.js.map