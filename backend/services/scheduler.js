const cron = require("node-cron");
const Product = require("../models/Product");
const Alert = require("../models/Alert");
const TrackedProduct = require("../models/TrackedProduct");
const User = require("../models/User");
const { scrapeProduct } = require("./scraper");
const { sendPriceDropEmail } = require("./emailService");

// Refresh all tracked product prices
async function refreshAllPrices() {
  console.log("⏰ [Scheduler] Starting price refresh...", new Date().toISOString());

  try {
    // Get all products that have at least one user tracking them
    const trackedProductIds = await TrackedProduct.distinct("product");
    const products = await Product.find({ _id: { $in: trackedProductIds } });

    console.log(`📦 Refreshing ${products.length} products...`);

    for (const product of products) {
      try {
        const freshData = await scrapeProduct(product.url);
        const oldPrice = product.currentPrice;
        const newPrice = freshData.currentPrice;

        // Update product with new price
        product.priceHistory.push({ price: oldPrice, date: new Date() });
        
        // Keep only last 90 days of history
        if (product.priceHistory.length > 90) {
          product.priceHistory = product.priceHistory.slice(-90);
        }

        product.currentPrice = newPrice;
        product.lastChecked = new Date();
        product.isAvailable = freshData.isAvailable;
        await product.save();

        console.log(`✅ Updated: ${product.title.substring(0, 40)}... | Old: ₹${oldPrice} → New: ₹${newPrice}`);

        // Check if price dropped — trigger alerts
        if (newPrice < oldPrice) {
          await checkAndTriggerAlerts(product, newPrice);
        }

        // Small delay to avoid hammering servers
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`❌ Failed to refresh ${product.title.substring(0, 40)}:`, err.message);
      }
    }

    console.log("✅ [Scheduler] Price refresh complete.");
  } catch (error) {
    console.error("❌ [Scheduler] Refresh failed:", error.message);
  }
}

// Check alerts and send emails
async function checkAndTriggerAlerts(product, newPrice) {
  const alerts = await Alert.find({
    product: product._id,
    isActive: true,
    isTriggered: false,
    targetPrice: { $gte: newPrice }, // Alert if current price <= target price
  }).populate("user");

  for (const alert of alerts) {
    try {
      const user = alert.user;
      if (!user || !user.emailNotifications) continue;

      await sendPriceDropEmail({
        userEmail: user.email,
        userName: user.name,
        product,
        targetPrice: alert.targetPrice,
      });

      // Mark alert as triggered
      alert.isTriggered = true;
      alert.triggeredAt = new Date();
      await alert.save();

      console.log(`🔔 Alert triggered for ${user.email} on ${product.title.substring(0, 30)}`);
    } catch (err) {
      console.error("Failed to send alert email:", err.message);
    }
  }
}

// Start the cron scheduler
function start() {
  // Run every 6 hours: "0 */6 * * *"
  // For testing, you can use "*/5 * * * *" (every 5 minutes)
  cron.schedule("0 */6 * * *", refreshAllPrices);
  console.log("⏰ Price refresh scheduler started (every 6 hours)");
}

module.exports = { start, refreshAllPrices };
