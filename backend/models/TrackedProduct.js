const mongoose = require("mongoose");

const trackedProductSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    targetPrice: {
      type: Number,
      default: null, // null = alert on any drop
    },
    alertEnabled: {
      type: Boolean,
      default: true,
    },
    inWishlist: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Each user can track a product only once
trackedProductSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("TrackedProduct", trackedProductSchema);
