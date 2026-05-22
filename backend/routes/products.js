const express = require("express");
const Product = require("../models/Product");
const TrackedProduct = require("../models/TrackedProduct");
const { protect } = require("../middleware/auth");
const { scrapeProduct } = require("../services/scraper");

const router = express.Router();

// POST /api/products/track — Add a product URL to track
router.post("/track", protect, async (req, res) => {
  try {
    const { url, targetPrice } = req.body;

    if (!url) return res.status(400).json({ message: "Product URL is required" });

    // Check if product already exists in DB
    let product = await Product.findOne({ url });

    if (!product) {
      // Scrape new product
      const scraped = await scrapeProduct(url);
      product = await Product.create({
        ...scraped,
        priceHistory: [{ price: scraped.currentPrice }],
      });
    }

    // Check if user already tracking this product
    const existing = await TrackedProduct.findOne({
      user: req.user._id,
      product: product._id,
    });

    if (existing) {
      return res.status(400).json({ message: "You are already tracking this product" });
    }

    const tracked = await TrackedProduct.create({
      user: req.user._id,
      product: product._id,
      targetPrice: targetPrice || null,
    });

    res.status(201).json({
      message: "Product added to tracking",
      product,
      tracked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/my — Get all products user is tracking
router.get("/my", protect, async (req, res) => {
  try {
    const tracked = await TrackedProduct.find({ user: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(tracked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id — Get single product with price history
router.get("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const tracked = await TrackedProduct.findOne({
      user: req.user._id,
      product: product._id,
    });

    res.json({ product, tracked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/products/:id — Update target price
router.put("/:id", protect, async (req, res) => {
  try {
    const { targetPrice, alertEnabled } = req.body;

    const tracked = await TrackedProduct.findOneAndUpdate(
      { user: req.user._id, product: req.params.id },
      { targetPrice, alertEnabled },
      { new: true }
    ).populate("product");

    if (!tracked) return res.status(404).json({ message: "Not found" });
    res.json(tracked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id — Stop tracking a product
router.delete("/:id", protect, async (req, res) => {
  try {
    const tracked = await TrackedProduct.findOneAndDelete({
      user: req.user._id,
      product: req.params.id,
    });

    if (!tracked) return res.status(404).json({ message: "Not tracking this product" });
    res.json({ message: "Product removed from tracking" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products/:id/refresh — Manually refresh a product's price
router.post("/:id/refresh", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const fresh = await scrapeProduct(product.url);
    
    product.priceHistory.push({ price: product.currentPrice });
    product.currentPrice = fresh.currentPrice;
    product.lastChecked = new Date();
    await product.save();

    res.json({ message: "Price refreshed", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
