export const getOrderConfirmationEmail = (orderData: {
    id: string;
    user: { name: string };
    shippingInfo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    pricing: {
        subtotal: number;
        shipping: number;
        creditApplied: number;
        total: number;
    };
    items: Array<{ name: string; quantity: number; price: number }>;
    createdAt: string;
}): string => {
    const orderNumber = orderData.id.substring(0, 8);
    const orderDate = new Date(orderData.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #000; margin-bottom: 30px; }
                    .order-meta { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                    .meta-column { flex: 1; }
                    .meta-label { font-weight: bold; color: #666; font-size: 14px; margin-bottom: 5px; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th { text-align: left; padding: 10px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
                    .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
                    .summary-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .summary-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .total-amount { font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
                    .footer { text-align: center; padding-top: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Order Confirmation</h2>
                    <p>Thank you for your purchase!</p>
                </div>

                <div class="order-meta">
                    <div class="meta-column">
                        <div class="meta-label">Order #</div>
                        <div>${orderNumber}</div>
                    </div>
                    <div class="meta-column">
                        <div class="meta-label">Date</div>
                        <div>${orderDate}</div>
                    </div>
                    <div class="meta-column">
                        <div class="meta-label">Status</div>
                        <div><strong>Confirmed</strong></div>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.items
                            .map(
                                (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                        </tr>
                        `,
                            )
                            .join("")}
                    </tbody>
                </table>
                        
                <div class="summary-box">
                    <div class="summary-item">
                        <span>Subtotal</span>
                        <span>$${orderData.pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Shipping</span>
                        <span>$${orderData.pricing.shipping.toFixed(2)}</span>
                    </div>
                    ${
                        orderData.pricing.creditApplied > 0
                            ? `
                    <div class="summary-item">
                        <span>Store Credit</span>
                        <span>-$${orderData.pricing.creditApplied.toFixed(2)}</span>
                    </div>
                    `
                            : ""
                    }
                    <div class="summary-item total-amount">
                        <span>Total Paid</span>
                        <span>$${orderData.pricing.total.toFixed(2)}</span>
                    </div>
                </div>
                        
                <div>
                    <h3>Shipping Address</h3>
                    <p>
                        ${orderData.shippingInfo.name}<br>
                        ${orderData.shippingInfo.address}<br>
                        ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} ${orderData.shippingInfo.zip}<br>
                        ${orderData.shippingInfo.country}
                    </p>
                </div>
                        
                <div class="footer">
                    <p>Your order will be processed shortly. You'll receive another email when it ships.</p>
                </div>
            </body>
            </html>`;
};

export const getOrderShippedEmail = (orderData: {
    id: string;
    user: { name: string };
    shippingInfo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    items: Array<{ name: string; quantity: number }>;
    trackingNumber: string;
}): string => {
    const orderNumber = orderData.id.substring(0, 8);

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 30px 0; background: #f0f9ff; border-radius: 8px; margin-bottom: 30px; }
                    .tracking-box { background: white; padding: 20px; border: 2px solid #0066cc; border-radius: 8px; text-align: center; margin: 20px 0; }
                    .tracking-number { font-size: 20px; font-weight: bold; color: #0066cc; margin: 10px 0; }
                    .button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
                    .items-list { margin: 20px 0; }
                    .item { padding: 5px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; padding-top: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Your Order Has Shipped! 🚚</h1>
                    <p>Order #${orderNumber} is on its way to you</p>
                </div>

                <p>Hello ${orderData.user.name},</p>

                <p>Great news! Your order has been shipped and is now in transit.</p>

                <div class="tracking-box">
                    <h3>Tracking Information</h3>
                    <div class="tracking-number">${orderData.trackingNumber}</div>
                    <p>Use this number to track your package</p>
                    <a href="https://www.ups.com/track?tracknum=${orderData.trackingNumber}" class="button" target="_blank">
                        Track Package
                    </a>
                </div>

                <div class="items-list">
                    <h3>Shipped Items</h3>
                    ${orderData.items
                        .map(
                            (item) => `
                    <div class="item">
                        ${item.name} × ${item.quantity}
                    </div>
                    `,
                        )
                        .join("")}
                </div>
                    
                <div>
                    <h3>Shipping To</h3>
                    <p>
                        ${orderData.shippingInfo.name}<br>
                        ${orderData.shippingInfo.address}<br>
                        ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} ${orderData.shippingInfo.zip}
                    </p>
                </div>
                    
                <p><strong>Delivery Estimate:</strong> 3-5 business days</p>
                    
                <p>If you have any questions about your delivery, please contact our support team.</p>
                    
                <div class="footer">
                    <p>Thank you for shopping with us!<br>
                    We hope you enjoy your purchase.</p>
                </div>
            </body>
            </html>`;
};

export const getOrderCancelledEmail = (orderData: { id: string; user: { name: string }; items: Array<{ name: string; quantity: number }>; total: number }): string => {
    const orderNumber = orderData.id.substring(0, 8);

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 30px 0; background: #fff5f5; border-radius: 8px; margin-bottom: 30px; }
                    .refund-box { background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .items-list { margin: 20px 0; }
                    .item { padding: 5px 0; border-bottom: 1px solid #eee; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Order Cancelled</h1>
                    <p>Order #${orderNumber} has been cancelled</p>
                </div>

                <p>Hello ${orderData.user.name},</p>

                <p>Your order has been cancelled as requested.</p>

                <div class="refund-box">
                    <h3>Refund Information</h3>
                    <p><strong>Refund Amount:</strong> $${orderData.total.toFixed(2)}</p>
                    <p>The refund will be processed to your original payment method within 5-10 business days.</p>
                </div>

                <div class="items-list">
                    <h3>Cancelled Items</h3>
                    ${orderData.items
                        .map(
                            (item) => `
                    <div class="item">
                        ${item.name} × ${item.quantity}
                    </div>
                    `,
                        )
                        .join("")}
                </div>
                    
                <p>If you didn't request this cancellation or have any questions, please contact our support team.</p>
                    
                <p>We hope to see you again soon!</p>
            </body>
            </html>`;
};

export const getOrderDeliveredEmail = (orderData: { id: string; user: { name: string } }): string => {
    const orderNumber = orderData.id.substring(0, 8);

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 30px 0; background: #f0fff4; border-radius: 8px; margin-bottom: 30px; }
                    .button { display: inline-block; background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Your Order Has Been Delivered! 📦</h1>
                    <p>Order #${orderNumber} has arrived</p>
                </div>

                <p>Hello ${orderData.user.name},</p>

                <p>We're happy to let you know that your order has been delivered!</p>

                <p>We hope everything arrived in perfect condition and you're satisfied with your purchase.</p>

                <p>If you have a moment, we'd love to hear about your experience with us. Your feedback helps us improve.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="button">Leave a Review</a>
                </div>

                <p>If you have any issues with your order or need assistance, please don't hesitate to contact our support team.</p>

                <p>Thank you for shopping with us!</p>
            </body>
            </html>`;
};

// Utility function for easy usage
export const OrderEmailTemplates = {
    confirmation: getOrderConfirmationEmail,
    shipped: getOrderShippedEmail,
    cancelled: getOrderCancelledEmail,
    delivered: getOrderDeliveredEmail,
};
