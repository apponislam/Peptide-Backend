import sendEmail from "../sendEmail";

export const getPasswordResetEmail = (data: { name: string; otp: string; resetToken: string; expiryMinutes?: number; directResetLink: string }): string => {
    const expiryTime = data.expiryMinutes || 10;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px 20px; text-align: center; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .content { padding: 25px; }
        .link-box, .otp-box { border-radius: 10px; padding: 20px; text-align: center; margin: 15px 0; }
        .link-box { background: #f0fdf4; border: 1px solid #10b981; }
        .otp-box { background: #f0f9ff; border: 1px solid #3b82f6; }
        .reset-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .otp-code { font-size: 36px; font-weight: 700; color: #1e40af; letter-spacing: 6px; background: white; padding: 10px 15px; border-radius: 8px; display: inline-block; border: 1px solid #dbeafe; font-family: monospace; margin: 10px 0; }
        .divider { text-align: center; margin: 15px 0; color: #94a3b8; position: relative; }
        .divider span { background: white; padding: 0 10px; }
        .divider:before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e8f0; z-index: -1; }
        .expiry-notice { background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 3px solid #f59e0b; margin: 15px 0; font-size: 14px; }
        .warning { color: #991b1b; font-size: 13px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; background: #f8fafc; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>PEPTIDE.CLUB</p>
        </div>
        
        <div class="content">
            <p style="margin-bottom: 15px;">Hello <strong>${data.name}</strong>,</p>
            
            <div class="link-box">
                <div style="font-weight: 600; color: #065f46; margin-bottom: 10px;">🔗 Direct Reset Link</div>
                <a href="${data.directResetLink}" class="reset-button">Reset Password Now</a>
            </div>
            
            <div class="divider"><span>OR</span></div>
            
            <div class="otp-box">
                <div style="font-weight: 600; color: #1e40af; margin-bottom: 10px;">📱 Use Code</div>
                <div class="otp-code">${data.otp}</div>
            </div>
            
            <div class="expiry-notice">
                ⏰ Expires in ${expiryTime} minutes
            </div>
            
            <div class="warning">
                ⚠️ Ignore this email if you didn't request this.
            </div>
        </div>
        
        <div class="footer">
            <div style="font-weight: 700; margin-bottom: 5px;">PEPTIDE.CLUB</div>
            <p>© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

export async function sendPasswordResetEmail(
    to: string,
    data: {
        name: string;
        otp: string;
        resetToken: string;
        directResetLink: string;
        expiryMinutes?: number;
    },
) {
    process.nextTick(async () => {
        try {
            const html = getPasswordResetEmail(data);
            await sendEmail(to, `🔐 Password Reset - PEPTIDE.CLUB`, html);
            console.log(`✅ Password reset email sent to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send password reset email:", error);
        }
    });
}
