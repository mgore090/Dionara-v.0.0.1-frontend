import React from "react";
import { Link } from "react-router-dom";
import "./MyAccount.css";
import { getLoggedInUser } from "./accountCommon";

const tiles = [
  { title: "My Profile", description: "View and update your personal details.", path: "/my-profile", icon: "♙" },
  { title: "My Orders", description: "Track your orders and view order history.", path: "/my-orders", icon: "▤" },
  { title: "Saved Addresses", description: "Manage your delivery addresses.", path: "/saved-addresses", icon: "⌖" },
];

export default function MyAccount() {
  const user = getLoggedInUser();

  if (!user) {
    return <main className="d-account-page"><div className="d-account-notice"><h2>Please login</h2><p>Login with your mobile number to access your account.</p><Link className="d-account-button" to="/login">Login</Link></div></main>;
  }

  return (
    <main className="d-account-page">
      <div className="d-account-container">
        <div className="d-account-heading">
          <p className="d-account-eyebrow">DIANORA CUSTOMER ACCOUNT</p>
          <h1>My Account</h1>
          <p>Welcome back{user.fullName ? `, ${user.fullName}` : ""}. Manage your account and orders here.</p>
        </div>
        <div className="d-account-grid">
          {tiles.map((tile) => (
            <Link to={tile.path} className="d-account-tile" key={tile.path}>
              <span className="d-account-tile-icon">{tile.icon}</span>
              <h2>{tile.title}</h2>
              <p>{tile.description}</p>
              <span className="d-account-tile-link">View details →</span>
            </Link>
          ))}
        </div>
        <div className="d-account-help"><strong>Need help?</strong><p>For order or delivery assistance, contact DIANORA customer support.</p></div>
      </div>
    </main>
  );
}
