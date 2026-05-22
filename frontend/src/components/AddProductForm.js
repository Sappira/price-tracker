import React, { useState } from "react";
import { trackProduct } from "../utils/api";
import "./AddProductForm.css";

export default function AddProductForm({ onClose, onAdded }) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!url.includes("amazon.in") && !url.includes("amazon.com") && !url.includes("flipkart.com")) {
      setError("Please enter a valid Amazon.in or Flipkart URL");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await trackProduct(url.trim(), targetPrice ? parseFloat(targetPrice) : null);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product. Check the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Track a Product</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="modal-sub">
          Paste a product URL from Amazon.in or Flipkart.com
        </p>

        <form onSubmit={handleSubmit} className="add-form">
          <div className="field">
            <label>Product URL *</label>
            <input
              className="input"
              type="url"
              placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Target Price (₹) — Optional</label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 1500 — get alerted when price drops to this"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min="1"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="mini-spinner"></span>
                  Fetching price...
                </>
              ) : (
                "Start Tracking"
              )}
            </button>
          </div>
        </form>

        <div className="url-examples">
          <p className="examples-label">Example URLs:</p>
          <code>https://www.amazon.in/dp/B09XYZ1234</code>
          <code>https://www.flipkart.com/product-name/p/itm123</code>
        </div>
      </div>
    </div>
  );
}
