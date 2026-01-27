import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api_key);

async function sendEmail() {
    try {
        const response = await resend.emails.send({
            from: "master@peptide.club",
            to: ["apponislamdev@gmail.com"],
            subject: "Test Email",
            html: "<p>This is a test email.</p>",
        });

        console.log("Email sent:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}

export default sendEmail;

// import { Resend } from "resend";

// const resend = new Resend("adsfasdf");

// resend.emails.send({
//     from: "onboarding@resend.dev",
//     to: "apponislamdev@gmail.com",
//     subject: "Hello World",
//     html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
// });
