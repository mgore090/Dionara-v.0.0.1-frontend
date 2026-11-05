import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Home_Banner_Dianora from "../assets/Home_Banner_Dianora.png";
import product1 from "../assets/product1.png";
import product2 from "../assets/product2.png";
import offerBanner from "../assets/offerBanner.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
    <section className="hero">
      <img
        src={Home_Banner_Dianora}
        alt="Dianora Skin Care Moisture and Suncream"
        className="home-banner"
      />

      <button
        className="hero-shop-btn"
        onClick={() => navigate("/allProducts")}
      >
        SHOP NOW
      </button>
    </section>

    
    <section className="category-section">
      <div className="category-container">

        <div
          className="category-card"
          onClick={() => navigate("/allProducts")}
        >
          <img src={product1} alt="Dianora skincare product 1" />
          <p>Moisture + Suncream</p>
        </div>

        <div
          className="category-card"
          onClick={() => navigate("/allProducts")}
        >
          <img src={product2} alt="Dianora skincare product 2" />
          <p>Daily Skincare Essentials</p>
        </div>
      </div>

      <h2 className="collection-title">
        DIANORA COLLECTION
      </h2>

    </section>

    <section className="buy-two-banner">
      <img
        src={offerBanner}
        alt="Dianora skincare duo"
        className="buy-two-image"
      />

      <div className="buy-two-content">
        <p className="offer-subtitle">YOUR DAILY GLOW RITUAL</p>

        <h1>
          BUY TWO
          <span>AT ₹299</span>
        </h1>

        <p className="offer-description">
          Double the care. Double the glow.
        </p>

        <button
          className="buy-two-button"
          onClick={() => navigate("/allProducts")}
        >
          SHOP NOW <span>→</span>
        </button>
      </div>
    </section>

    </>

  );
};

export default Home;
