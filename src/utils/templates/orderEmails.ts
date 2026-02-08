// import sendEmail from "../sendEmail";
// import { OrderEmailTemplates } from "./orderEmailTemplate";

// export async function sendOrderConfirmationEmail(to: string, orderData: any) {
//     process.nextTick(async () => {
//         try {
//             const html = OrderEmailTemplates.confirmation(orderData);
//             await sendEmail(to, `Order Confirmation #${orderData.id.substring(0, 8)}`, html);
//             console.log(`✅ Order confirmation email sent to ${to}`);
//         } catch (error) {
//             console.error("❌ Failed to send order confirmation email:", error);
//         }
//     });
// }

// export async function sendOrderShippedEmail(to: string, orderData: any) {
//     process.nextTick(async () => {
//         try {
//             const html = OrderEmailTemplates.shipped(orderData);
//             await sendEmail(to, `Your Order Has Shipped! #${orderData.id.substring(0, 8)}`, html);
//             console.log(`✅ Order shipped email sent to ${to}`);
//         } catch (error) {
//             console.error("❌ Failed to send order shipped email:", error);
//         }
//     });
// }

// export async function sendOrderCancelledEmail(to: string, orderData: any) {
//     process.nextTick(async () => {
//         try {
//             const html = OrderEmailTemplates.cancelled(orderData);
//             await sendEmail(to, `Order Cancelled #${orderData.id.substring(0, 8)}`, html);
//             console.log(`✅ Order cancelled email sent to ${to}`);
//         } catch (error) {
//             console.error("❌ Failed to send order cancelled email:", error);
//         }
//     });
// }

// export async function sendOrderDeliveredEmail(to: string, orderData: any) {
//     process.nextTick(async () => {
//         try {
//             const html = OrderEmailTemplates.delivered(orderData);
//             await sendEmail(to, `Your Order Has Been Delivered! #${orderData.id.substring(0, 8)}`, html);
//             console.log(`✅ Order delivered email sent to ${to}`);
//         } catch (error) {
//             console.error("❌ Failed to send order delivered email:", error);
//         }
//     });
// }

// // Optional: Export all email sending functions
// export const OrderEmailSenders = {
//     confirmation: sendOrderConfirmationEmail,
//     shipped: sendOrderShippedEmail,
//     cancelled: sendOrderCancelledEmail,
//     delivered: sendOrderDeliveredEmail,
// };
