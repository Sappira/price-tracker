import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-logo">
          <span>🛒</span>
          <span className="nav-logo-text">PriceWatch</span>
        </div>
        <div className="nav-right">
          <span className="nav-user">👤 {user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
