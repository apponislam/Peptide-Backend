import catchAsync from "../../../utils/catchAsync";
import { checkoutServices } from "./checkout.services";
import sendResponse from "../../../utils/sendResponse.";
// Create Stripe checkout session
const createCheckoutSession = catchAsync(async (req, res) => {
    const { items, customer_email, success_url, cancel_url } = req.body;
    const result = await checkoutServices.createCheckoutSession({
        items,
        customer_email,
        success_url,
        cancel_url,
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
});
// Verify Stripe session
const verifySession = catchAsync(async (req, res) => {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Session ID is required",
            data: null,
        });
    }
    const result = await checkoutServices.verifySession(sessionId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Session verified successfully",
        data: result,
    });
});
export const checkoutControllers = {
    createCheckoutSession,
    verifySession,
};
//# sourceMappingURL=checkout.controllers.js.map