import React, { useState, useEffect } from "react";
import { getAlerts, createAlert, deleteAlert } from "../utils/api";

export default function AlertsTab({ products }) {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ productId: "", targetPrice: "" });
  const [loading, setLoading] = useState(false);

  const loadAlerts = async () => {
    const { data } = await getAlerts();
    setAlerts(data);
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.targetPrice) return;
    setLoading(true);
    try {
      await createAlert(form.productId, parseFloat(form.targetPrice));
      setForm({ productId: "", targetPrice: "" });
      loadAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Create Alert Form */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>🔔 Set Price Alert</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Product</label>
            <select
              className="input"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
              style={{ background: "var(--surface2)" }}
            >
              <option value="">Select a tracked product...</option>
              {products.map((item) => (
                <option key={item._id} value={item.product?._id}>
                  {item.product?.title?.substring(0, 60)}...
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}>
            <label>Target Price (₹)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 1499"
              value={form.targetPrice}
              onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
              required
              min="1"
            />
          </div>
          <button className="btn btn-primary" disabled={loading} style={{ marginBottom: 0 }}>
            {loading ? "Saving..." : "Set Alert"}
          </button>
        </form>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔔</span>
          <h3>No alerts set</h3>
          <p>Set a target price above — we'll email you when it drops.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alerts.map((alert) => (
            <div key={alert._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>
                  {alert.product?.title?.substring(0, 70)}...
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span className="badge badge-yellow">
                    🎯 Target: ₹{alert.targetPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="badge badge-green">
                    💰 Current: ₹{alert.product?.currentPrice?.toLocaleString("en-IN")}
                  </span>
                  <span className={`badge ${alert.isTriggered ? "badge-purple" : "badge-green"}`}>
                    {alert.isTriggered ? "✅ Triggered" : alert.isActive ? "🟢 Active" : "⭘ Inactive"}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={async () => { await deleteAlert(alert._id); loadAlerts(); }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
