import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    // Temporary local demo only. Not secure authentication.
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      setError("Admin demo credentials are not configured.");
      return;
    }

    if (email.trim().toLowerCase() === adminEmail.toLowerCase()
        && password === adminPassword) {
      sessionStorage.setItem("dinoraAdminDemo", "true");
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Invalid admin email or password.");
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <p className="admin-login-brand">DIANORA</p>
        <p className="admin-login-eyebrow">ADMINISTRATION</p>
        <h1>Welcome Back</h1>
        <p className="admin-login-description">
          Sign in to manage your skincare store.
        </p>

        {error && <div className="admin-login-error">{error}</div>}

        <label htmlFor="admin-email">Admin Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          required
        />

        <button type="submit">SIGN IN TO ADMIN</button>

        <p className="admin-login-note">
          Development demo only. This is not production authentication.
        </p>
      </form>
    </main>
  );
};

export default AdminLogin;
