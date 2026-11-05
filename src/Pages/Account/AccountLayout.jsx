// import React from "react";
// import { NavLink, Link } from "react-router-dom";
// import { getLoggedInUser } from "./accountCommon";
// import "./AccountPages.css";

// export default function AccountLayout({ title, subtitle, children }) {
//   const user = getLoggedInUser();
//   if (!user) return <main className="d-account-inner"><section className="d-account-panel d-account-empty"><h2>Please login to continue</h2><p>Your customer account is not available. Login using your mobile number.</p><Link to="/login" className="d-account-primary">Login</Link></section></main>;

//   return <main className="d-account-inner">
//     <header className="d-inner-heading"><span>DIANORA ACCOUNT</span><h1>{title}</h1><p>{subtitle}</p></header>
//     <div className="d-inner-layout">
//       <aside className="d-account-sidebar">
//         <div className="d-sidebar-customer"><div className="d-customer-avatar">{(user.fullName || "D").trim().charAt(0).toUpperCase()}</div><div><strong>{user.fullName || "DIANORA Customer"}</strong><small>{user.phone || "Mobile number not available"}</small></div></div>
//         <nav>
//           <NavLink to="/my-account">Account Overview</NavLink>
//           <NavLink to="/my-profile">My Profile</NavLink>
//           <NavLink to="/my-orders">My Orders</NavLink>
//           <NavLink to="/saved-addresses">Saved Addresses</NavLink>
//           <button type="button" onClick={() => { localStorage.removeItem("dinoraUser"); localStorage.removeItem("dinoraDemoUser"); window.location.href = "/login"; }}>Logout</button>
//         </nav>
//       </aside>
//       <section className="d-account-panel">{children}</section>
//     </div>
//   </main>;
// }


import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { getLoggedInUser } from "./accountCommon";
import "./AccountPages.css";

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

export default function AccountLayout({ title, subtitle, children }) {
  const [user, setUser] = useState(() => getLoggedInUser());

  useEffect(() => {
    const refreshUser = () => setUser(getLoggedInUser());
    window.addEventListener("dinora-auth-updated", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener("dinora-auth-updated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  if (!user) return <main className="d-account-inner"><section className="d-account-panel d-account-empty"><h2>Please login to continue</h2><p>Your customer account is not available. Login using your mobile number.</p><Link to="/login" className="d-account-primary">Login</Link></section></main>;

  return <main className="d-account-inner">
    <header className="d-inner-heading"><span>DIANORA ACCOUNT</span><h1>{title}</h1><p>{subtitle}</p></header>
    <div className="d-inner-layout">
      <aside className="d-account-sidebar">
        <div className="d-sidebar-customer"><div className="d-customer-avatar">{formatFullName(user.fullName || "D").trim().charAt(0).toUpperCase()}</div><div><strong>{formatFullName(user.fullName || "DIANORA Customer")}</strong><small>{user.phone || "Mobile number not available"}</small></div></div>
        <nav>
          <NavLink to="/my-account">Account Overview</NavLink>
          <NavLink to="/my-profile">My Profile</NavLink>
          <NavLink to="/my-orders">My Orders</NavLink>
          <NavLink to="/saved-addresses">Saved Addresses</NavLink>
          <button type="button" onClick={() => { localStorage.removeItem("dinoraUser"); localStorage.removeItem("dinoraDemoUser"); window.location.href = "/login"; }}>Logout</button>
        </nav>
      </aside>
      <section className="d-account-panel">{children}</section>
    </div>
  </main>;
}
