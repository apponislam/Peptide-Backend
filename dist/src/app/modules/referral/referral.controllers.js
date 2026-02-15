"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse."));
const referral_services_1 = require("./referral.services");
// Get referral stats
const getReferralStats = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "User not authenticated",
            data: null,
        });
    }
    const stats = await referral_services_1.referralServices.getReferralStats(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Referral stats retrieved successfully",
        data: stats,
    });
});
exports.referralControllers = {
    getReferralStats,
};
//# sourceMappingURL=referral.controllers.js.map