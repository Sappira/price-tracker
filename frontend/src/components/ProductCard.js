import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { deleteProduct, toggleWishlist, refreshProduct } from "../utils/api";
import "./ProductCard.css";

const platformColors = {
  amazon: "#FF9900",
  flipkart: "#2874F0",
};

const platformLabels = {
  amazon: "Amazon",
  flipkart: "Flipkart",
};

export default function ProductCard({ trackedItem, onRemoved, onWishlistToggled }) {
  const { product, inWishlist, targetPrice } = trackedItem;
  const [showChart, setShowChart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistState, setWishlistState] = useState(inWishlist);

  if (!product) return null;

  const discount =
    product.originalPrice && product.currentPrice < product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
        )
      : null;

  const chartData = [
    ...product.priceHistory.map((h) => ({
      date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      price: h.price,
    })),
    {
      date: "Now",
      price: product.currentPrice,
    },
  ].slice(-14); // Last 14 data points

  const handleRemove = async () => {
    if (!window.confirm("Stop tracking this product?")) return;
    await deleteProduct(product._id);
    onRemoved();
  };

  const handleWishlist = async () => {
    await toggleWishlist(product._id);
    setWishlistState(!wishlistState);
    onWishlistToggled();
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshProduct(product._id);
      onRemoved(); // Reload products
    } catch (e) {
      alert("Refresh failed: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      {/* Platform Badge */}
      <div className="card-top">
        <span
          className="platform-badge"
          style={{ color: platformColors[product.platform] }}
        >
          {product.platform === "amazon" ? "🟠" : "🔵"}{" "}
          {platformLabels[product.platform]}
        </span>
        <div className="card-actions">
          <button
            className={`icon-btn ${wishlistState ? "active-heart" : ""}`}
            onClick={handleWishlist}
            title="Toggle Wishlist"
          >
            {wishlistState ? "❤️" : "🤍"}
          </button>
          <button
            className="icon-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Price"
          >
            {loading ? "⏳" : "🔄"}
          </button>
          <button
            className="icon-btn danger"
            onClick={handleRemove}
            title="Remove"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Product Image */}
      {product.image && (
        <div className="card-image-wrap">
          <img src={product.image} alt={product.title} className="card-image" />
        </div>
      )}

      {/* Title */}
      <h3 className="card-title">
        <a href={product.url} target="_blank" rel="noopener noreferrer">
          {product.title.length > 80
            ? product.title.substring(0, 80) + "..."
            : product.title}
        </a>
      </h3>

      {/* Price Row */}
      <div className="price-row">
        <span className="current-price">
          ₹{product.currentPrice.toLocaleString("en-IN")}
        </span>
        {product.originalPrice && product.originalPrice > product.currentPrice && (
          <span className="original-price">
            ₹{product.originalPrice.toLocaleString("en-IN")}
          </span>
        )}
        {discount && (
          <span className="discount-badge">{discount}% off</span>
        )}
      </div>

      {/* Meta */}
      <div className="card-meta">
        {product.rating && (
          <span className="meta-item">⭐ {product.rating}</span>
        )}
        {targetPrice && (
          <span className="meta-item target">
            🎯 Target: ₹{targetPrice.toLocaleString("en-IN")}
          </span>
        )}
        <span className="meta-item">
          🕐 {new Date(product.lastChecked).toLocaleDateString("en-IN")}
        </span>
      </div>

      {/* Chart Toggle */}
      {chartData.length > 1 && (
        <div className="chart-section">
          <button
            className="chart-toggle"
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? "▲ Hide" : "📈 Price History"}
          </button>
          {showChart && (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#7a82a0" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#7a82a0" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e2230",
                      border: "1px solid #2a2f3d",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#6c63ff"
                    strokeWidth={2}
                    dot={{ fill: "#6c63ff", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
