// orderTemplates.ts

export interface OrderData {
    id: string;
    user: {
        name: string;
        email: string;
        tier: string;
    };
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
    status: string;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    createdAt: string;
    trackingNumber?: string;
}

// Simple email template generator
export class OrderEmailTemplates {
    // Order Confirmation Email - Simple Overview
    static getOrderConfirmationEmail(order: OrderData): string {
        const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
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
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .invoice-header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 30px;
        }
        
        .invoice-header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 24px;
        }
        
        .order-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .meta-column {
            flex: 1;
        }
        
        .meta-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .meta-value {
            font-size: 16px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .items-table th {
            text-align: left;
            padding: 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            font-weight: 600;
            color: #555;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .total-row {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        .summary-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .total-amount {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            border-top: 2px solid #e0e0e0;
            padding-top: 15px;
            margin-top: 15px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e8f5e9;
            color: #2e7d32;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="invoice-header">
        <h1>Order Confirmation</h1>
        <p>Thank you for your purchase!</p>
    </div>
    
    <div class="order-meta">
        <div class="meta-column">
            <div class="meta-label">Order #</div>
            <div class="meta-value">${order.id.substring(0, 8)}</div>
        </div>
        <div class="meta-column">
            <div class="meta-label">Date</div>
            <div class="meta-value">${formattedDate}</div>
        </div>
        <div class="meta-column">
            <div class="meta-label">Status</div>
            <div class="meta-value">
                <span class="status-badge">${order.status}</span>
            </div>
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
            ${order.items
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
            <span>$${order.pricing.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Shipping</span>
            <span>$${order.pricing.shipping.toFixed(2)}</span>
        </div>
        ${
            order.pricing.creditApplied > 0
                ? `
        <div class="summary-item">
            <span>Store Credit Used</span>
            <span>-$${order.pricing.creditApplied.toFixed(2)}</span>
        </div>
        `
                : ""
        }
        <div class="summary-item total-amount">
            <span>Total</span>
            <span>$${order.pricing.total.toFixed(2)}</span>
        </div>
    </div>
    
    <div class="shipping-info">
        <h3 style="margin-bottom: 10px; color: #555;">Shipping To</h3>
        <p style="margin: 0;">
            ${order.shippingInfo.name}<br>
            ${order.shippingInfo.address}<br>
            ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zip}<br>
            ${order.shippingInfo.country}
        </p>
    </div>
    
    ${
        order.trackingNumber
            ? `
    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Tracking Information</h3>
        <p style="margin: 0;">Your order is being prepared for shipment. Tracking: ${order.trackingNumber}</p>
    </div>
    `
            : ""
    }
    
    <div class="footer">
        <p>Thank you for shopping with us!<br>
        Your order is being processed and you will receive updates via email.</p>
    </div>
</body>
</html>
    `;
    }

    // Shipping Notification Email
    static getShippingNotificationEmail(order: OrderData): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Shipped!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            padding: 30px 0;
            background: #1a1a1a;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        
        .content {
            padding: 30px;
            background: #f8f9fa;
        }
        
        .tracking-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #e0e0e0;
        }
        
        .tracking-number {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 10px 0;
        }
        
        .button {
            display: inline-block;
            background: #1a1a1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Order Has Shipped!</h1>
        <p>Order #${order.id.substring(0, 8)} is on its way</p>
    </div>
    
    <div class="content">
        <p>Hello ${order.user.name},</p>
        
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div class="tracking-box">
            <h3>Tracking Information</h3>
            <div class="tracking-number">${order.trackingNumber}</div>
            <p>You can track your package using the number above.</p>
            <a href="#" class="button">Track Package</a>
        </div>
        
        <p><strong>Shipping Address:</strong><br>
        ${order.shippingInfo.name}<br>
        ${order.shippingInfo.address}<br>
        ${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.zip}
        </p>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>
        The Team</p>
    </div>
</body>
</html>
    `;
    }

    // Order Status Update Email
    static getOrderStatusUpdateEmail(order: OrderData, newStatus: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .status-box {
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
        }
        
        .status-label {
            font-size: 18px;
            font-weight: 600;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <h2>Order Status Update</h2>
    
    <p>Hello ${order.user.name},</p>
    
    <p>Your order <strong>#${order.id.substring(0, 8)}</strong> status has been updated:</p>
    
    <div class="status-box">
        <div class="status-label">${newStatus}</div>
    </div>
    
    <p><strong>Order Summary:</strong><br>
    Total: $${order.pricing.total.toFixed(2)}<br>
    Items: ${order.items.length} product(s)</p>
    
    <p>You can view your order details in your account dashboard.</p>
    
    <p>Best regards,<br>
    The Team</p>
</body>
</html>
    `;
    }

    // Utility function to format currency
    static formatCurrency(amount: number): string {
        return `$${amount.toFixed(2)}`;
    }

    // Utility function to get status color
    static getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            PENDING: "#ff9800",
            PAID: "#4caf50",
            SHIPPED: "#2196f3",
            CANCELLED: "#f44336",
            PROCESSING: "#ff9800",
            COMPLETED: "#4caf50",
        };
        return colors[status] || "#666";
    }
}

// Export individual templates for easy use
export const orderTemplates = {
    confirmation: OrderEmailTemplates.getOrderConfirmationEmail,
    shipping: OrderEmailTemplates.getShippingNotificationEmail,
    statusUpdate: OrderEmailTemplates.getOrderStatusUpdateEmail,
};
