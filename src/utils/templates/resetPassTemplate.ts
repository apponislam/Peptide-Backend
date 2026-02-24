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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        
        /* OTP Box */
        .otp-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0; }
        .otp-label { color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
        .otp-code { font-size: 48px; font-weight: 700; color: #1e40af; letter-spacing: 8px; background: white; padding: 20px 25px; border-radius: 12px; display: inline-block; border: 2px solid #dbeafe; font-family: monospace; }
        
        /* Direct Link Box */
        .link-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0; }
        .link-label { color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
        .reset-button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: all 0.3s; }
        .reset-button:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        
        /* Divider */
        .divider { display: flex; align-items: center; text-align: center; margin: 30px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #e2e8f0; }
        .divider span { padding: 0 10px; color: #94a3b8; font-size: 14px; }
        
        /* Expiry Notice */
        .expiry-notice { background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 25px; border-left: 4px solid #f59e0b; }
        .expiry-title { color: #92400e; font-weight: 600; margin-bottom: 5px; }
        .expiry-text { color: #92400e; font-size: 14px; }
        
        /* Warning */
        .warning-box { background: #fee2e2; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #ef4444; }
        .warning-text { color: #991b1b; font-size: 14px; margin: 0; }
        
        .footer { text-align: center; padding: 30px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Reset your password for PEPTIDE.CLUB</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Hello <strong>${data.name}</strong>,</p>
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">We received a request to reset your password. Choose one of the methods below:</p>
            
            <!-- Direct Reset Link (Primary) -->
            <div class="link-box">
                <div class="link-label">🔗 Direct Reset Link</div>
                <a href="${data.directResetLink}" class="reset-button">Reset Password Now</a>
                <p style="color: #065f46; margin-top: 15px;">Click the button above to reset your password instantly</p>
            </div>
            
            <!-- Divider -->
            <div class="divider">
                <span>OR</span>
            </div>
            
            <!-- OTP Code -->
            <div class="otp-box">
                <div class="otp-label">📱 Use Verification Code</div>
                <div class="otp-code">${data.otp}</div>
                <p style="color: #1e40af; margin-top: 15px;">Enter this 6-digit code on the password reset page</p>
            </div>
            
            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <div class="expiry-title">⏰ This will expire in ${expiryTime} minutes</div>
                <p class="expiry-text">For your security, both the link and code are valid for ${expiryTime} minutes only.</p>
            </div>
            
            <!-- Warning -->
            <div class="warning-box">
                <p class="warning-text">⚠️ If you didn't request this password reset, please ignore this email or contact support if you're concerned.</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="logo">PEPTIDE.CLUB</div>
            <p>Premium peptides, delivered with care.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PEPTIDE.CLUB. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};

// Email sending function
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
            await sendEmail(to, `🔐 Password Reset Request - PEPTIDE.CLUB`, html);
            console.log(`✅ Password reset email sent to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send password reset email:", error);
        }
    });
}
