import React from "react";
import { toggleWishlist } from "../utils/api";

export default function WishlistTab({ wishlist, onRefresh }) {
  if (wishlist.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">❤️</span>
        <h3>Your wishlist is empty</h3>
        <p>Heart a product from your tracked list to add it here.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
        {wishlist.length} product{wishlist.length !== 1 ? "s" : ""} in wishlist
      </p>
      <div className="products-grid">
        {wishlist.map((item) => {
          const p = item.product;
          if (!p) return null;
          return (
            <div key={item._id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                   style={{ color: "var(--text)", fontWeight: 500, fontSize: 14, textDecoration: "none", flex: 1 }}>
                  {p.title.length > 70 ? p.title.substring(0, 70) + "..." : p.title}
                </a>
                <button
                  className="icon-btn"
                  onClick={async () => { await toggleWishlist(p._id); onRefresh(); }}
                  style={{ marginLeft: 8, flexShrink: 0 }}
                >
                  ❤️
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", fontFamily: "Syne" }}>
                  ₹{p.currentPrice.toLocaleString("en-IN")}
                </span>
                {p.originalPrice && p.originalPrice > p.currentPrice && (
                  <span style={{ fontSize: 13, color: "var(--muted)", textDecoration: "line-through" }}>
                    ₹{p.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {p.platform === "amazon" ? "🟠 Amazon" : "🔵 Flipkart"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
