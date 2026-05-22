const express = require("express");
const Alert = require("../models/Alert");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/alerts
router.get("/", protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/alerts
router.post("/", protect, async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice) {
      return res.status(400).json({ message: "Product ID and target price are required" });
    }

    // Deactivate old alerts for same product
    await Alert.updateMany(
      { user: req.user._id, product: productId, isActive: true },
      { isActive: false }
    );

    const alert = await Alert.create({
      user: req.user._id,
      product: productId,
      targetPrice,
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/alerts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
