// import React, { useEffect, useState } from "react";
// import "./Navbar.css";
// import "./NavbarProfile.css";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// import DIANORA_logo from "../../assets/vite.png";
// import cart_icon from "../../assets/cart_icon.png";

// import {
//   getCartCount,
//   getCartItems,
//   CART_UPDATED_EVENT,
// } from "../Cart/cartUtils";

// const USER_STORAGE_KEY = "dinoraUser";

// const formatFullName = (name = "") =>
//   String(name)
//     .trim()
//     .toLowerCase()
//     .split(/\s+/)
//     .filter(Boolean)
//     .map((word) =>
//       word
//         .split(/([-'])/)
//         .map((part) =>
//           part === "-" || part === "'" ? part : part.charAt(0).toUpperCase() + part.slice(1)
//         )
//         .join("")
//     )
//     .join(" ");

// const Navbar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [cartCount, setCartCount] = useState(() =>
//     getCartCount(getCartItems())
//   );
//   const [user, setUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const isAdminRoute = location.pathname.startsWith("/admin");

//   const loadUser = () => {
//     const savedUser = localStorage.getItem(USER_STORAGE_KEY);

//     if (!savedUser) {
//       setUser(null);
//       return;
//     }

//     try {
//       const parsedUser = JSON.parse(savedUser);
//       // Only consider a customer logged in if the verified backend user ID exists.
//       if (parsedUser?.id || parsedUser?.userId) {
//         const formattedUser = {
//           ...parsedUser,
//           fullName: formatFullName(parsedUser.fullName || "Dianora Customer"),
//         };
//         setUser(formattedUser);
//       } else {
//         setUser(null);
//       }
//     } catch {
//       setUser(null);
//     }
//   };

//   useEffect(() => {
//     const updateCartCount = () => {
//       setCartCount(getCartCount(getCartItems()));
//     };

//     updateCartCount();
//     loadUser();

//     window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
//     window.addEventListener("storage", updateCartCount);
//     window.addEventListener("storage", loadUser);
//     // Custom event allows Login/Logout in the same browser tab to update Navbar.
//     window.addEventListener("dinora-auth-updated", loadUser);

//     return () => {
//       window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
//       window.removeEventListener("storage", updateCartCount);
//       window.removeEventListener("storage", loadUser);
//       window.removeEventListener("dinora-auth-updated", loadUser);
//     };
//   }, []);

//   // Re-check the saved session after navigation (including returning from OTP login).
//   useEffect(() => {
//     loadUser();
//     setShowProfileMenu(false);
//   }, [location.pathname]);

//   const handleLogout = () => {
//     localStorage.removeItem(USER_STORAGE_KEY);
//     // Clear legacy demo identity, if it exists.
//     localStorage.removeItem("dinoraDemoUser");
//     setUser(null);
//     setShowProfileMenu(false);
//     window.dispatchEvent(new Event("dinora-auth-updated"));
//     navigate("/home");
//   };

//   return (
//     <div className="navbar">
//       <div className="nav-logo">
//         <Link to="/home">
//           <img src={DIANORA_logo} alt="Dianora Logo" height="100px" />
//         </Link>
//       </div>

//       <ul className="nav-menu">
//         <li><Link to="/home">Home</Link></li>
//         <li><Link to="/newArrivals">New Arrivals</Link></li>
//         <li><Link to="/allProducts">All Products</Link></li>
//         <li><Link to="/aboutUs">About Us</Link></li>
//       </ul>

//       <div className="nav-login-cart">
//         {!user ? (
//           <Link to="/login">
//             <button type="button">Login</button>
//           </Link>
//         ) : (
//           <div className="dinora-profile-wrap">
//             <button
//               type="button"
//               className="dinora-profile-button"
//               style={{ border: "none", borderRadius: 0, background: "transparent", width: "auto", height: "auto", minWidth: "0", padding: "8px", boxShadow: "none" }}
//               aria-label="Open customer profile menu"
//               aria-expanded={showProfileMenu}
//               onClick={() => setShowProfileMenu((prev) => !prev)}
//               title={formatFullName(user.fullName || user.phone || "My Profile")}
//             >
//               <svg
//                 width="25"
//                 height="25"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.7"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 aria-hidden="true"
//               >
//                 <circle cx="12" cy="8" r="4" />
//                 <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
//               </svg>
//             </button>

//             {showProfileMenu && (
//               <div className="dinora-profile-dropdown">
//                 <div className="dinora-profile-heading">
//                   <strong>{formatFullName(user.fullName || "Dianora Customer")}</strong>
//                   <span>{user.phone || ""}</span>
//                 </div>

//                 <Link to="/my-profile" onClick={() => setShowProfileMenu(false)}>
//                   My Profile
//                 </Link>
//                 <Link to="/my-orders" onClick={() => setShowProfileMenu(false)}>
//                   My Orders
//                 </Link>
//                 <Link to="/saved-addresses" onClick={() => setShowProfileMenu(false)}>
//                   Saved Addresses
//                 </Link>

//                 <button type="button" onClick={handleLogout}>
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         <Link
//           to="/cart"
//           className="nav-cart"
//           aria-label={`Shopping Cart, ${cartCount} items`}
//         >
//           <img src={cart_icon} alt="Shopping Cart" height="40px" />
//           <span className="nav-cart-count">{cartCount}</span>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Navbar;


import React, { useEffect, useState } from "react";
import "./Navbar.css";
import "./NavbarProfile.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

import DIANORA_logo from "../../assets/vite.png";


import {
  getCartCount,
  getCartItems,
  CART_UPDATED_EVENT,
} from "../Cart/cartUtils";

const USER_STORAGE_KEY = "dinoraUser";

const formatFullName = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split(/([-'])/)
        .map((part) =>
          part === "-" || part === "'" ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("")
    )
    .join(" ");

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(() =>
    getCartCount(getCartItems())
  );
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const loadUser = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      // Only consider a customer logged in if the verified backend user ID exists.
      if (parsedUser?.id || parsedUser?.userId) {
        const formattedUser = {
          ...parsedUser,
          fullName: formatFullName(parsedUser.fullName || "Dianora Customer"),
        };
        setUser(formattedUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount(getCartItems()));
    };

    updateCartCount();
    loadUser();

    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("storage", loadUser);
    // Custom event allows Login/Logout in the same browser tab to update Navbar.
    window.addEventListener("dinora-auth-updated", loadUser);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("dinora-auth-updated", loadUser);
    };
  }, []);

  // Re-check the saved session after navigation (including returning from OTP login).
  useEffect(() => {
    loadUser();
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    // Clear legacy demo identity, if it exists.
    localStorage.removeItem("dinoraDemoUser");
    setUser(null);
    setShowProfileMenu(false);
    window.dispatchEvent(new Event("dinora-auth-updated"));
    navigate("/home");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <Link to="/home">
          <img src={DIANORA_logo} alt="Dianora Logo" height="100px" />
        </Link>
      </div>

      <ul className="nav-menu">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/newArrivals">New Arrivals</Link></li>
        <li><Link to="/allProducts">All Products</Link></li>
        <li><Link to="/aboutUs">About Us</Link></li>
      </ul>

      <div className="nav-login-cart">
        {!user ? (
          <Link to="/login">
            <button type="button">Login</button>
          </Link>
        ) : (
          <div className="dinora-profile-wrap">
            <button
              type="button"
              className="dinora-profile-button"
              style={{ border: "none", borderRadius: 0, background: "transparent", width: "auto", height: "auto", minWidth: "0", padding: "8px", boxShadow: "none" }}
              aria-label="Open customer profile menu"
              aria-expanded={showProfileMenu}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title={formatFullName(user.fullName || user.phone || "My Profile")}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="dinora-profile-dropdown">
                <div className="dinora-profile-heading">
                  <strong>{formatFullName(user.fullName || "Dianora Customer")}</strong>
                  <span>{user.phone || ""}</span>
                </div>

                <Link to="/my-profile" onClick={() => setShowProfileMenu(false)}>
                  My Profile
                </Link>
                <Link to="/my-orders" onClick={() => setShowProfileMenu(false)}>
                  My Orders
                </Link>
                <Link to="/saved-addresses" onClick={() => setShowProfileMenu(false)}>
                  Saved Addresses
                </Link>

                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        <Link
          to="/cart"
          className="nav-cart"
          aria-label={`Shopping Cart, ${cartCount} items`}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "48px",
            color: "#000",
            textDecoration: "none",
          }}
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 7h6l5 25a4 4 0 0 0 4 3h16a4 4 0 0 0 4-3l4-18H12" />
            <circle cx="19" cy="42" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="37" cy="42" r="2.5" fill="currentColor" stroke="none" />
          </svg>

          <span
            className="nav-cart-count"
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#000",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: "500",
              lineHeight: 1,
            }}
          >
            {cartCount}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

