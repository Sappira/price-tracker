import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Products
export const trackProduct = (url, targetPrice) =>
  api.post("/products/track", { url, targetPrice });

export const getMyProducts = () => api.get("/products/my");

export const deleteProduct = (productId) => api.delete(`/products/${productId}`);

export const refreshProduct = (productId) =>
  api.post(`/products/${productId}/refresh`);

export const updateTrackedProduct = (productId, data) =>
  api.put(`/products/${productId}`, data);

// Wishlist
export const getWishlist = () => api.get("/wishlist");
export const toggleWishlist = (productId) => api.post(`/wishlist/${productId}`);

// Alerts
export const getAlerts = () => api.get("/alerts");
export const createAlert = (productId, targetPrice) =>
  api.post("/alerts", { productId, targetPrice });
export const deleteAlert = (alertId) => api.delete(`/alerts/${alertId}`);

export default api;
