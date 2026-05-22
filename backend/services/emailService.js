const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use Gmail App Password (not your real password)
    },
  });
};

// Send price drop alert email
async function sendPriceDropEmail({ userEmail, userName, product, targetPrice }) {
  const transporter = createTransporter();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { background: white; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .product-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .price-row { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
        .current-price { font-size: 32px; font-weight: bold; color: #28a745; }
        .original-price { font-size: 18px; color: #999; text-decoration: line-through; }
        .discount-badge { background: #ff4444; color: white; padding: 4px 10px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .cta-button { display: block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; text-align: center; padding: 16px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Price Drop Alert!</h1>
          <p>Great news, ${userName}! A product on your watchlist just dropped in price.</p>
        </div>
        <div class="content">
          <div class="product-card">
            ${product.image ? `<img src="${product.image}" alt="${product.title}" style="width:100%;max-height:200px;object-fit:contain;border-radius:6px;margin-bottom:12px;" />` : ""}
            <h2 style="margin: 0 0 12px; font-size: 16px; color: #333;">${product.title}</h2>
            <div class="price-row">
              <span class="current-price">₹${product.currentPrice.toLocaleString("en-IN")}</span>
              ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString("en-IN")}</span>` : ""}
              ${discount ? `<span class="discount-badge">${discount}% OFF</span>` : ""}
            </div>
            ${targetPrice ? `<p style="color: #666; font-size: 14px;">Your target price was: <strong>₹${targetPrice.toLocaleString("en-IN")}</strong></p>` : ""}
            <p style="color: #666; font-size: 14px;">Platform: <strong>${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}</strong></p>
          </div>
          <a href="${product.url}" class="cta-button">🛒 Buy Now on ${product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}</a>
          <p style="color: #999; font-size: 13px; text-align: center;">⚡ Prices change frequently. Act fast before the price goes back up!</p>
        </div>
        <div class="footer">
          <p>You're receiving this because you set a price alert on PriceWatch.</p>
          <p>© 2024 PriceWatch — E-Commerce Price Tracker</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"PriceWatch 🛒" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎉 Price Drop! ${product.title.substring(0, 50)}... now ₹${product.currentPrice.toLocaleString("en-IN")}`,
    html,
  });

  console.log(`📧 Price drop email sent to ${userEmail}`);
}

// Send welcome email
async function sendWelcomeEmail({ userEmail, userName }) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"PriceWatch 🛒" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Welcome to PriceWatch! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #667eea;">Welcome, ${userName}! 🎉</h1>
        <p>You're now set up to track prices on Amazon & Flipkart.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>🔍 Search and add products to track</li>
          <li>❤️ Save items to your wishlist</li>
          <li>🔔 Set target prices for alerts</li>
          <li>📧 Get emailed when prices drop</li>
        </ul>
        <p>Start tracking and save money!</p>
      </div>
    `,
  });
}

module.exports = { sendPriceDropEmail, sendWelcomeEmail };
