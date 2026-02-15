"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const config_1 = __importDefault(require("../config"));
const resend = new resend_1.Resend(config_1.default.resend_api_key);
async function sendEmail(to, subject, html) {
    const fromEmail = config_1.default.resend_email;
    try {
        const response = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: html,
        });
        // console.log("Email sent:", response);
        return { success: true, data: response };
    }
    catch (error) {
        // console.error("Error:", error);
        return { success: false, error: error.message };
    }
}
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map