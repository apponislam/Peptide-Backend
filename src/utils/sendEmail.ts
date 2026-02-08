import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api_key);

export async function sendEmail(to: string | string[], subject: string, html: string) {
    const fromEmail = config.resend_email!;

    try {
        const response = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: html,
        });

        // console.log("Email sent:", response);
        return { success: true, data: response };
    } catch (error: any) {
        // console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

export default sendEmail;
