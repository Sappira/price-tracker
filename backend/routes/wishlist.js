const express = require("express");
const TrackedProduct = require("../models/TrackedProduct");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/wishlist
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await TrackedProduct.find({
      user: req.user._id,
      inWishlist: true,
    }).populate("product");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist/:productId — Toggle wishlist
router.post("/:productId", protect, async (req, res) => {
  try {
    const tracked = await TrackedProduct.findOne({
      user: req.user._id,
      product: req.params.productId,
    });

    if (!tracked) {
      return res.status(404).json({ message: "You must track this product first" });
    }

    tracked.inWishlist = !tracked.inWishlist;
    await tracked.save();

    res.json({
      message: tracked.inWishlist ? "Added to wishlist" : "Removed from wishlist",
      inWishlist: tracked.inWishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
