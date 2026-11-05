// import React from "react";
// import { Link } from "react-router-dom";
// import "./Footer.css";

// const Footer = () => {
//   return (
//     <footer className="dianora-footer">

//       <div className="footer-main">

//         {/* Brand */}
//         <div className="footer-brand">
//           <h2>DIANORA</h2>
//           <p className="footer-tagline">
//             Your glow, your way.
//           </p>
//           <p>
//             Thoughtful skincare for your everyday glow.
//             Discover your daily skincare essentials with Dianora.
//           </p>

//           <a
//             href="https://www.instagram.com/dianora_skincare/"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="footer-instagram"
//           >
//             <span>◎</span> Follow us on Instagram
//           </a>
//         </div>

//         {/* Quick Links */}
//         <div className="footer-links">
//           <h3>EXPLORE</h3>
//           <Link to="/home">Home</Link>
//           <Link to="/newArrivals">New Arrivals</Link>
//           <Link to="/allProducts">All Products</Link>
//           <Link to="/aboutUs">About Us</Link>
//         </div>

//         {/* Customer Care */}
//         <div className="footer-links">
//           <h3>HELP & SUPPORT</h3>
//           <Link to="/contact">Contact Us</Link>
//           <Link to="/shipping">Shipping Policy</Link>
//           <Link to="/returns">Returns & Refunds</Link>
//           <Link to="/privacy">Privacy Policy</Link>
//         </div>

//         {/* Social */}
//         <div className="footer-social">
//           <h3>STAY CONNECTED</h3>
//           <p>Follow our skincare journey and discover more.</p>

//           <a
//             href="https://www.instagram.com/dianora_skincare/"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="footer-social-link"
//           >
//             Instagram ↗
//           </a>
//         </div>

//       </div>

//       <div className="footer-bottom">
//         <p>© {new Date().getFullYear()} DIANORA SKIN CARE. All rights reserved.</p>
//         <p>Made with care for your everyday glow.</p>
//       </div>

//     </footer>
//   );
// };

// export default Footer;


import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  const instagramUrl = "https://www.instagram.com/dianora_skincare/";

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            DIANORA
          </Link>

          <p className="footer-description">
            DIANORA Skin Care brings you everyday skincare essentials
            designed to nourish, moisturize, and protect your skin.
            Discover your daily glow with us.
          </p>

          <div className="footer-socials">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="instagram-link"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.8" r="1" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>

          <p>
            Call: <a href="tel:+917058805659">+91 7058805659</a>
          </p>

          <p>
            WhatsApp:{" "}
            <a
              href="https://wa.me/917058805659"
              target="_blank"
              rel="noreferrer"
            >
              +91 7058805659
            </a>
          </p>

          <p>
            Email: <a href="mailto:dinora@gmail.com">dinora@gmail.com</a>
          </p>

          <p className="footer-address">
            Address: S/O: Anil Gore, Plot No. 32, Ward No. 28,
            Near Hasare Gharkul, Shri Nagar, Jadhao Lay-Out,
            Pusad, Yavatmal, Maharashtra - 445204
          </p>
        </div>
      </div>

      <div className="footer-policy">
        <Link to="/aboutUs">About Us</Link>
        <a href="mailto:dinora@gmail.com?subject=Return%20Policy">
          Return Policy
        </a>
        <a href="mailto:dinora@gmail.com?subject=Terms%20and%20Conditions">
          Terms &amp; Conditions
        </a>
        <a href="mailto:dinora@gmail.com?subject=Privacy%20Policy">
          Privacy Policy
        </a>
        <a href="mailto:dinora@gmail.com?subject=Shipping%20Policy">
          Shipping Policy
        </a>
      </div>

      <div className="footer-searches">
        <strong>Explore Skincare</strong>
        <Link to="/allProducts">All Products</Link>
        <Link to="/newArrivals">New Arrivals</Link>
        <span>Moisturizing Skincare</span>
        <span>Sun Protection</span>
        <span>Daily Skincare</span>
        <span>Healthy Glow</span>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} DIANORA Skin Care. All rights reserved.</p>

        <button
          className="go-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
        ↑ &nbsp; Go to Top
        </button>
      </div>
    </footer>
  );
}

export default Footer;
