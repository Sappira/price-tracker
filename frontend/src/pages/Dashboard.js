import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProducts, getWishlist } from "../utils/api";
import Navbar from "../components/Navbar";
import AddProductForm from "../components/AddProductForm";
import ProductCard from "../components/ProductCard";
import WishlistTab from "../components/WishlistTab";
import AlertsTab from "../components/AlertsTab";
import "./Dashboard.css";

const TABS = [
  { id: "tracked", label: "📦 Tracked", count: true },
  { id: "wishlist", label: "❤️ Wishlist" },
  { id: "alerts", label: "🔔 Alerts" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("tracked");
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    const { data } = await getWishlist();
    setWishlist(data);
  };

  useEffect(() => {
    loadProducts();
    loadWishlist();
  }, []);

  const stats = {
    total: products.length,
    drops: products.filter(
      (p) => p.product?.currentPrice < (p.product?.originalPrice || Infinity)
    ).length,
    savings: products.reduce((sum, p) => {
      const orig = p.product?.originalPrice || 0;
      const curr = p.product?.currentPrice || 0;
      return sum + Math.max(0, orig - curr);
    }, 0),
  };

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dash-content">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Products Tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-num green">{stats.drops}</span>
            <span className="stat-label">Price Drops</span>
          </div>
          <div className="stat-card">
            <span className="stat-num yellow">
              ₹{stats.savings.toLocaleString("en-IN")}
            </span>
            <span className="stat-label">Total Savings</span>
          </div>
          <div className="stat-card">
            <span className="stat-num purple">{wishlist.length}</span>
            <span className="stat-label">In Wishlist</span>
          </div>
        </div>

        {/* Tab Bar + Add Button */}
        <div className="tab-bar">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.count && products.length > 0 && (
                  <span className="tab-count">{products.length}</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            + Track Product
          </button>
        </div>

        {/* Add Product Form Modal */}
        {showAddForm && (
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onAdded={() => { loadProducts(); setShowAddForm(false); }}
          />
        )}

        {/* Tab Content */}
        {tab === "tracked" && (
          <div>
            {loading ? (
              <div className="empty-state">
                <div className="spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <h3>No products tracked yet</h3>
                <p>Paste an Amazon or Flipkart product URL to start tracking.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  + Add First Product
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((item) => (
                  <ProductCard
                    key={item._id}
                    trackedItem={item}
                    onRemoved={loadProducts}
                    onWishlistToggled={loadWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wishlist" && (
          <WishlistTab wishlist={wishlist} onRefresh={loadWishlist} />
        )}

        {tab === "alerts" && <AlertsTab products={products} />}
      </div>
    </div>
  );
}
