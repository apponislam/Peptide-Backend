import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";
import { referralServices } from "./referral.services";
// Get referral stats
const getReferralStats = catchAsync(async (req, res) => {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
        return sendResponse(res, {
            statusCode: 401,
            success: false,
            message: "User not authenticated",
            data: null,
        });
    }
    const stats = await referralServices.getReferralStats(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral stats retrieved successfully",
        data: stats,
    });
});
export const referralControllers = {
    getReferralStats,
};
//# sourceMappingURL=referral.controllers.js.map