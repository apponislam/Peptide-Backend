"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEmailSenders = exports.OrderEmailTemplates = exports.getOrderRefundedEmail = exports.getOrderDeliveredEmail = exports.getOrderCancelledEmail = exports.getOrderShippedEmail = exports.getOrderConfirmationEmail = void 0;
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
exports.sendOrderShippedEmail = sendOrderShippedEmail;
exports.sendOrderCancelledEmail = sendOrderCancelledEmail;
exports.sendOrderDeliveredEmail = sendOrderDeliveredEmail;
exports.sendOrderRefundedEmail = sendOrderRefundedEmail;
const sendEmail_1 = __importDefault(require("../sendEmail"));
const getOrderConfirmationEmail = (orderData) => {
    const orderNumber = orderData.id.replace("ord_", "").toUpperCase();
    const orderDate = new Date(orderData.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { font-size: 28px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .order-meta { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
        .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .meta-item { text-align: center; }
        .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; font-weight: 600; }
        .meta-value { font-size: 16px; font-weight: 600; color: #1e293b; }
        .status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { text-align: left; padding: 12px 15px; background: #f8fafc; color: #64748b; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        .items-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
        .item-name { font-weight: 500; color: #1e293b; }
        .item-qty { color: #64748b; text-align: center; }
        .item-price { color: #1e293b; text-align: right; font-weight: 500; }
        .summary-box { background: #f8fafc; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 16px; }
        .summary-label { color: #64748b; }
        .summary-value { font-weight: 500; color: #1e293b; }
        .total-row { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 15px; font-size: 18px; font-weight: 600; color: #1e293b; }
        .shipping-address { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-top: 25px; border-left: 4px solid #3b82f6; }
        .address-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 10px; }
        .address-text { color: #1e293b; line-height: 1.8; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }
        .highlight { color: #3b82f6; font-weight: 600; }
        .discount { color: #10b981; font-weight: 600; }
        .credit-used { color: #f59e0b; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for shopping with PEPTIDE.CLUB</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Order Meta -->
            <div class="order-meta">
                <div class="meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Order Number</div>
                        <div class="meta-value">#${orderNumber}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Order Date</div>
                        <div class="meta-value">${orderDate}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Status</div>
                        <div class="status-badge">Confirmed</div>
                    </div>
                </div>
            </div>
            
            <!-- Items -->
            <div>
                <h2 class="section-title">Order Items</h2>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.items
        .map((item) => `
                        <tr>
                            <td class="item-name">${item.name}</td>
                            <td class="item-qty">${item.quantity}</td>
                            <td class="item-price">$${item.price.toFixed(2)}</td>
                        </tr>
                        `)
        .join("")}
                    </tbody>
                </table>
            </div>
            
            <!-- Order Summary -->
            <div class="summary-box">
                <h2 class="section-title">Order Summary</h2>
                <div class="summary-item">
                    <span class="summary-label">Subtotal</span>
                    <span class="summary-value">$${orderData.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Shipping</span>
                    <span class="summary-value">$${orderData.pricing.shipping.toFixed(2)}</span>
                </div>
                ${orderData.pricing.creditApplied > 0
        ? `
                <div class="summary-item">
                    <span class="summary-label credit-used">Store Credit Applied</span>
                    <span class="summary-value credit-used">-$${orderData.pricing.creditApplied.toFixed(2)}</span>
                </div>
                `
        : ""}
                <div class="summary-item total-row">
                    <span class="summary-label">Total Paid</span>
                    <span class="summary-value">$${orderData.pricing.total.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Shipping Address -->
            <div class="shipping-address">
                <div class="address-title">Shipping Address</div>
                <div class="address-text">
                    ${orderData.shippingInfo.name}<br>
                    ${orderData.shippingInfo.address}<br>
                    ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} ${orderData.shippingInfo.zip}<br>
                    ${orderData.shippingInfo.country}
                </div>
            </div>
            
            <!-- Next Steps -->
            <div style="margin-top: 25px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin-bottom: 10px;">📦 What's Next?</h3>
                <p style="color: #047857; margin-bottom: 5px;">• Your order is being processed</p>
                <p style="color: #047857; margin-bottom: 5px;">• You'll receive a shipping confirmation email with tracking</p>
                <p style="color: #047857;">• Estimated delivery: 3-7 business days</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="logo">PEPTIDE.CLUB</div>
            <p>Questions about your order? Reply to this email or contact our support team.</p>

            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PEPTIDE.CLUB. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};
exports.getOrderConfirmationEmail = getOrderConfirmationEmail;
const getOrderShippedEmail = (orderData) => {
    const orderNumber = orderData.id.replace("ord_", "").toUpperCase();
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Shipped! - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .tracking-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
        .tracking-title { color: #1e40af; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .tracking-number { font-size: 24px; font-weight: 700; color: #1e40af; margin: 15px 0; letter-spacing: 1px; background: white; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 1px solid #dbeafe; }
        .track-button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 15px; transition: all 0.3s; }
        .track-button:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
        .items-grid { display: grid; gap: 12px; }
        .item-card { background: #f8fafc; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #3b82f6; }
        .item-name { font-weight: 500; color: #1e293b; }
        .item-qty { color: #64748b; font-weight: 600; }
        .shipping-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .address-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
        .address-text { color: #475569; line-height: 1.8; }
        .delivery-estimate { background: #f0fdf4; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #10b981; }
        .estimate-title { color: #065f46; font-weight: 600; margin-bottom: 5px; }
        .estimate-days { color: #047857; font-weight: 600; font-size: 18px; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚚 Your Order Has Shipped!</h1>
            <p>Order #${orderNumber} is on its way to you</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Hello <strong>${orderData.user.name}</strong>,</p>
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Great news! Your order has been shipped and is now in transit.</p>
            
            <!-- Tracking Info -->
            <div class="tracking-box">
                <div class="tracking-title">📦 Tracking Information</div>
                <div class="tracking-number">${orderData.trackingNumber}</div>
                <p style="color: #475569; margin-bottom: 20px;">Use this tracking number to follow your package</p>
                <a href="https://www.ups.com/track?tracknum=${orderData.trackingNumber}" class="track-button" target="_blank">
                    Track Package Now
                </a>
            </div>
            
            <!-- Items -->
            <h2 class="section-title">📋 Shipped Items</h2>
            <div class="items-grid">
                ${orderData.items
        .map((item) => `
                <div class="item-card">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Qty: ${item.quantity}</span>
                </div>
                `)
        .join("")}
            </div>
            
            <!-- Shipping Address -->
            <div class="shipping-info">
                <div class="address-title">📍 Shipping To</div>
                <div class="address-text">
                    ${orderData.shippingInfo.name}<br>
                    ${orderData.shippingInfo.address}<br>
                    ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} ${orderData.shippingInfo.zip}
                </div>
            </div>
            
            <!-- Delivery Estimate -->
            <div class="delivery-estimate">
                <div class="estimate-title">⏰ Estimated Delivery</div>
                <div class="estimate-days">3-5 Business Days</div>
                <p style="color: #047857; margin-top: 8px; font-size: 14px;">Your package will arrive soon!</p>
            </div>
            
            <!-- Support Message -->
            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0;">Need help with your delivery? Reply to this email or contact our support team.</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="logo">PEPTIDE.CLUB</div>
            <p>Thank you for shopping with us!</p>

            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PEPTIDE.CLUB. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};
exports.getOrderShippedEmail = getOrderShippedEmail;
const getOrderCancelledEmail = (orderData) => {
    const orderNumber = orderData.id.replace("ord_", "").toUpperCase();
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancelled - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .refund-box { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
        .refund-title { color: #991b1b; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .refund-amount { font-size: 24px; font-weight: 700; color: #991b1b; margin: 15px 0; letter-spacing: 1px; background: white; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 1px solid #fecaca; }
        .refund-info { color: #7f1d1d; margin: 15px 0; line-height: 1.8; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
        .items-grid { display: grid; gap: 12px; }
        .item-card { background: #f8fafc; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #ef4444; }
        .item-name { font-weight: 500; color: #1e293b; }
        .item-qty { color: #64748b; font-weight: 600; }
        .support-box { background: #fef3c7; border-radius: 8px; padding: 20px; margin-top: 25px; border-left: 4px solid #f59e0b; }
        .support-title { color: #92400e; font-weight: 600; margin-bottom: 10px; }
        .support-text { color: #92400e; line-height: 1.8; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }

    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>❌ Order Cancelled</h1>
            <p>Order #${orderNumber} has been cancelled</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Hello <strong>${orderData.user.name}</strong>,</p>
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Your order has been cancelled as requested.</p>
            
            <!-- Refund Information -->
            <div class="refund-box">
                <div class="refund-title">💰 Refund Information</div>
                <div class="refund-amount">$${orderData.total.toFixed(2)}</div>
                <p class="refund-info">
                    The refund will be processed to your original payment method within <strong>5-10 business days</strong>.<br>
                    You will receive another email once the refund has been processed.
                </p>
            </div>
            
            <!-- Cancelled Items -->
            <h2 class="section-title">📦 Cancelled Items</h2>
            <div class="items-grid">
                ${orderData.items
        .map((item) => `
                <div class="item-card">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Qty: ${item.quantity}</span>
                </div>
                `)
        .join("")}
            </div>
            
            <!-- Support Information -->
            <div class="support-box">
                <div class="support-title">❓ Have Questions?</div>
                <p class="support-text">
                    If you didn't request this cancellation or have any questions about the refund,<br>
                    please reply to this email or contact our support team.
                </p>
            </div>
            
            <!-- Hope to See You Again -->
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="color: #047857; margin: 0; text-align: center; font-size: 16px;">
                    We hope to see you again soon at PEPTIDE.CLUB!
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="logo">PEPTIDE.CLUB</div>
            <p>Thank you for being a valued customer.</p>

            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} PEPTIDE.CLUB. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};
exports.getOrderCancelledEmail = getOrderCancelledEmail;
const getOrderDeliveredEmail = (orderData) => {
    const orderNumber = orderData.id.replace("ord_", "").toUpperCase();
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .delivery-box { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0; }
        .delivery-icon { font-size: 48px; margin-bottom: 20px; }
        .delivery-title { color: #065f46; font-size: 20px; font-weight: 600; margin-bottom: 15px; }
        .delivery-message { color: #047857; font-size: 16px; line-height: 1.8; margin-bottom: 20px; }
        .review-button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 15px; transition: all 0.3s; }
        .review-button:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .support-box { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-top: 25px; border-left: 4px solid #3b82f6; }
        .support-title { color: #1e40af; font-weight: 600; margin-bottom: 10px; }
        .support-text { color: #1e40af; line-height: 1.8; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📦 Order Delivered!</h1>
            <p>Order #${orderNumber} has arrived</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Hello <strong>${orderData.user.name}</strong>,</p>
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">We're happy to let you know that your order has been delivered!</p>
            
            <!-- Delivery Celebration -->
            <div class="delivery-box">
                <div class="delivery-icon">🎉</div>
                <div class="delivery-title">Your Package Has Arrived!</div>
                <p class="delivery-message">
                    We hope everything arrived in perfect condition and<br>
                    you're satisfied with your purchase from PEPTIDE.CLUB.
                </p>
            </div>
            
            <!-- Support Information -->
            <div class="support-box">
                <div class="support-title">🛠️ Need Assistance?</div>
                <p class="support-text">
                    If you have any issues with your order or need assistance,<br>
                    please don't hesitate to contact our support team.
                </p>
            </div>
            
            <!-- Thank You Message -->
            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; text-align: center;">
                <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">
                    Thank you for choosing PEPTIDE.CLUB!
                </p>
                <p style="color: #92400e; margin-top: 10px;">
                    We appreciate your business and hope to serve you again soon.
                </p>
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
exports.getOrderDeliveredEmail = getOrderDeliveredEmail;
const getOrderRefundedEmail = (orderData) => {
    const orderNumber = orderData.id.replace("ord_", "").toUpperCase();
    const refundAmount = orderData.total; // Use the total passed (which is refund amount)
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Refunded - PEPTIDE.CLUB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .refund-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
        .refund-title { color: #92400e; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .refund-amount { font-size: 24px; font-weight: 700; color: #92400e; margin: 15px 0; letter-spacing: 1px; background: white; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 1px solid #fde68a; }
        .refund-info { color: #92400e; margin: 15px 0; line-height: 1.8; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
        .items-grid { display: grid; gap: 12px; }
        .item-card { background: #f8fafc; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #f59e0b; }
        .item-name { font-weight: 500; color: #1e293b; }
        .item-qty { color: #64748b; font-weight: 600; }
        .support-box { background: #f0f9ff; border-radius: 8px; padding: 20px; margin-top: 25px; border-left: 4px solid #3b82f6; }
        .support-title { color: #1e40af; font-weight: 600; margin-bottom: 10px; }
        .support-text { color: #1e40af; line-height: 1.8; }
        .timeline-box { background: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 20px; border-left: 4px solid #10b981; }
        .timeline-title { color: #065f46; font-weight: 600; margin-bottom: 15px; }
        .timeline-item { display: flex; align-items: center; margin-bottom: 12px; color: #047857; }
        .timeline-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 12px; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .logo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>💰 Order Refunded</h1>
            <p>Refund issued for Order #${orderNumber}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">Hello <strong>${orderData.user.name}</strong>,</p>
            <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">We've processed a refund for your recent order.</p>
            
            <!-- Refund Information -->
            <div class="refund-box">
                <div class="refund-title">💸 Refund Processed</div>
                <div class="refund-amount">$${refundAmount.toFixed(2)}</div>
                <p class="refund-info">
                    A refund of <strong>$${refundAmount.toFixed(2)}</strong> has been issued for your order.
                </p>
            </div>
            
            <!-- Refund Timeline -->
            <div class="timeline-box">
                <div class="timeline-title">⏰ Refund Timeline</div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>Refund processed by PEPTIDE.CLUB</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>Funds will appear in your account within <strong>5-10 business days</strong></div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>Processing time depends on your bank or payment provider</div>
                </div>
            </div>
            
            <!-- Refunded Items -->
            <h2 class="section-title">📦 Refunded Items</h2>
            <div class="items-grid">
                ${orderData.items
        .map((item) => `
                <div class="item-card">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Qty: ${item.quantity}</span>
                </div>
                `)
        .join("")}
            </div>
            
            <!-- Support Information -->
            <div class="support-box">
                <div class="support-title">❓ Questions About Your Refund?</div>
                <p class="support-text">
                    If you have any questions about this refund or need assistance,<br>
                    please reply to this email or contact our support team.
                </p>
            </div>
            
            <!-- Hope to See You Again -->
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="color: #047857; margin: 0; text-align: center; font-size: 16px;">
                    Thank you for being a valued PEPTIDE.CLUB customer!
                </p>
                <p style="color: #047857; margin-top: 10px; text-align: center;">
                    We hope to have the opportunity to serve you again in the future.
                </p>
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
exports.getOrderRefundedEmail = getOrderRefundedEmail;
// Add email sending functions
async function sendOrderConfirmationEmail(to, orderData) {
    process.nextTick(async () => {
        try {
            const html = (0, exports.getOrderConfirmationEmail)(orderData);
            await (0, sendEmail_1.default)(to, `🎉 Order Confirmation #${orderData.id.replace("ord_", "").toUpperCase()} - PEPTIDE.CLUB`, html);
            console.log(`✅ Order confirmation email sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Failed to send order confirmation email:", error);
        }
    });
}
async function sendOrderShippedEmail(to, orderData) {
    process.nextTick(async () => {
        try {
            const html = (0, exports.getOrderShippedEmail)(orderData);
            await (0, sendEmail_1.default)(to, `🚚 Your Order Has Shipped! #${orderData.id.replace("ord_", "").toUpperCase()} - PEPTIDE.CLUB`, html);
            console.log(`✅ Order shipped email sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Failed to send order shipped email:", error);
        }
    });
}
async function sendOrderCancelledEmail(to, orderData) {
    process.nextTick(async () => {
        try {
            const html = (0, exports.getOrderCancelledEmail)(orderData);
            await (0, sendEmail_1.default)(to, `❌ Order Cancelled #${orderData.id.replace("ord_", "").toUpperCase()} - PEPTIDE.CLUB`, html);
            console.log(`✅ Order cancelled email sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Failed to send order cancelled email:", error);
        }
    });
}
async function sendOrderDeliveredEmail(to, orderData) {
    process.nextTick(async () => {
        try {
            const html = (0, exports.getOrderDeliveredEmail)(orderData);
            await (0, sendEmail_1.default)(to, `📦 Order Delivered! #${orderData.id.replace("ord_", "").toUpperCase()} - PEPTIDE.CLUB`, html);
            console.log(`✅ Order delivered email sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Failed to send order delivered email:", error);
        }
    });
}
async function sendOrderRefundedEmail(to, orderData) {
    process.nextTick(async () => {
        try {
            const html = (0, exports.getOrderRefundedEmail)(orderData);
            await (0, sendEmail_1.default)(to, `💰 Order Refunded #${orderData.id.replace("ord_", "").toUpperCase()} - PEPTIDE.CLUB`, html);
            console.log(`✅ Order refunded email sent to ${to}`);
        }
        catch (error) {
            console.error("❌ Failed to send order refunded email:", error);
        }
    });
}
// Utility functions for easy usage
exports.OrderEmailTemplates = {
    confirmation: exports.getOrderConfirmationEmail,
    shipped: exports.getOrderShippedEmail,
    cancelled: exports.getOrderCancelledEmail,
    delivered: exports.getOrderDeliveredEmail,
    refunded: exports.getOrderRefundedEmail,
};
// Export email sending functions as well
exports.OrderEmailSenders = {
    confirmation: sendOrderConfirmationEmail,
    shipped: sendOrderShippedEmail,
    cancelled: sendOrderCancelledEmail,
    delivered: sendOrderDeliveredEmail,
    refunded: sendOrderRefundedEmail,
};
//# sourceMappingURL=orderEmailTemplate.js.map