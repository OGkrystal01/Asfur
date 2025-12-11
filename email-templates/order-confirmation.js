// Email template for order confirmations
module.exports = function createOrderConfirmationEmail(order) {
  const { orderNumber, customerName, customerEmail, items, total } = order;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Alovre</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .order-details {
          margin: 20px 0;
          border: 1px solid #eee;
          border-radius: 5px;
          padding: 15px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .total {
          font-weight: bold;
          margin-top: 15px;
          text-align: right;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 10px;
          border-radius: 4px;
          text-decoration: none;
          text-align: center;
          font-weight: bold;
        }
        .button-primary {
          background-color: #000;
          color: #fff;
        }
        .button-outline {
          border: 2px solid #000;
          color: #000;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
        }
        .highlight-box {
          background-color: #f8f8f8;
          border-left: 4px solid #000;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #0A0F2C; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Alovre</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0;">Order Confirmation</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0A0F2C; margin-top: 0;">Thank you for your order!</h2>
          <p>Hi ${customerName},</p>
          <p>We've received your order and will process it shortly. Here are your order details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0A0F2C;">#${orderNumber}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                  <strong>${item.title}</strong>
                  ${item.variant ? `<br><small>${item.variant}</small>` : ''}
                  <br>Quantity: ${item.quantity}
                </div>
                <div>€${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div style="font-weight: bold; margin-top: 15px; text-align: right;">
              Total: €${total.toFixed(2)}
            </div>
          </div>
          
          <div style="background-color: #f8f8f8; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
            <h3>🎉 Your PDF files are ready to download!</h3>
            <p>You can access your purchased tutorial files by logging into your account on our website. These tutorials will guide you step-by-step on how to successfully resell these products for maximum profit.</p>
          </div>
          
          <p>If you have any questions about your order or need assistance with the tutorials, please don't hesitate to reply to this email - we're here to help you succeed!</p>
          
          <div style="text-align: center;">
            <a href="https://alovre.com/pages/contact.html" style="color: #0A0F2C; text-decoration: none; padding: 10px 20px; margin: 20px 10px; border-radius: 4px; font-weight: bold;">Contact Support</a>
            <a href="https://alovre.com/pages/order-tracking.html?order=${orderNumber}" style="color: #ffffff; text-decoration: none; padding: 10px 20px; margin: 20px 10px; border-radius: 4px; font-weight: bold; background-color: #0A0F2C;">Track Your Order</a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Alovre. All rights reserved.</p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://alovre.com" style="color: #0A0F2C; text-decoration: none;">Visit our website</a> | 
            <a href="https://alovre.com/pages/contact.html" style="color: #0A0F2C; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
