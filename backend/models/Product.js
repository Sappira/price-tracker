const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    image: { type: String, default: "" },
    platform: {
      type: String,
      enum: ["amazon", "flipkart", "other"],
      required: true,
    },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number },
    currency: { type: String, default: "INR" },
    rating: { type: Number },
    reviewCount: { type: Number },
    priceHistory: [priceHistorySchema],
    lastChecked: { type: Date, default: Date.now },
    asin: { type: String }, // Amazon product ID
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtuals
productSchema.virtual("lowestPrice").get(function () {
  if (!this.priceHistory.length) return this.currentPrice;
  return Math.min(...this.priceHistory.map((h) => h.price));
});

productSchema.virtual("highestPrice").get(function () {
  if (!this.priceHistory.length) return this.currentPrice;
  return Math.max(...this.priceHistory.map((h) => h.price));
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
