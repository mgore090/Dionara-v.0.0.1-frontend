
import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

import DIANORA_logo from "../../assets/vite.png";
import cart_icon from "../../assets/cart_icon.png";

import {
  getCartCount,
  getCartItems,
  CART_UPDATED_EVENT,
} from "../Cart/cartUtils";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(() =>
    getCartCount(getCartItems())
  );

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount(getCartItems()));
    };

    // Update count when Navbar loads
    updateCartCount();

    // Update immediately when cart changes in this tab
    window.addEventListener(
      CART_UPDATED_EVENT,
      updateCartCount
    );

    // Update when localStorage changes in another tab
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  return (
    <div className="navbar">
      <div className="nav-logo">
        <Link to="/home">
          <img
            src={DIANORA_logo}
            alt="Dianora Logo"
            height="100px"
          />
        </Link>
      </div>

      <ul className="nav-menu">
        <li>
          <Link to="/home">Home</Link>
        </li>

        <li>
          <Link to="/newArrivals">New Arrivals</Link>
        </li>

        <li>
          <Link to="/allProducts">All Products</Link>
        </li>

        <li>
          <Link to="/aboutUs">About Us</Link>
        </li>
      </ul>

      <div className="nav-login-cart">
        <Link to="/login">
          <button type="button">Login</button>
        </Link>

        <Link
          to="/cart"
          className="nav-cart"
          aria-label={`Shopping Cart, ${cartCount} items`}
        >
          <img
            src={cart_icon}
            alt="Shopping Cart"
            height="40px"
          />

          <span className="nav-cart-count">
            {cartCount}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
