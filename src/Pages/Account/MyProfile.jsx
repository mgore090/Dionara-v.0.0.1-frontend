import React, { useEffect, useState } from "react";
import AccountLayout from "./AccountLayout";
import { apiRequest, getLoggedInUser } from "./accountCommon";

const formatFullName = (name = "") => {
  return String(name)
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
};

export default function MyProfile() {
  const user = getLoggedInUser();
  const [form, setForm] = useState({
    fullName: formatFullName(user?.fullName || ""),
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    apiRequest(`/users/${user.id}`)
      .then((data) => {
        const record = data?.data || data;
        const formattedName = formatFullName(record.fullName ?? user.fullName ?? "");
        setForm({
          fullName: formattedName,
          email: record.email ?? user.email ?? "",
          phone: record.phone ?? user.phone ?? "",
        });

        // Keep Navbar and AccountLayout synced with the name from backend.
        const syncedUser = {
          ...user,
          fullName: formattedName,
          email: record.email ?? user.email ?? "",
          phone: record.phone ?? user.phone ?? "",
        };
        localStorage.setItem("dinoraUser", JSON.stringify(syncedUser));
        window.dispatchEvent(new Event("dinora-auth-updated"));
      })
      .catch(() => {
        // Retain the customer data available in the login response.
      });
  }, []); // Intentionally load profile once when this page mounts.

  const change = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatNameOnBlur = () => {
    setForm((prev) => ({ ...prev, fullName: formatFullName(prev.fullName) }));
  };

  async function save(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    const formattedName = formatFullName(form.fullName);
    if (!formattedName) return setError("Full name is required.");
    if (!user?.id) return setError("Customer ID not found. Please login again.");

    setLoading(true);
    try {
      const updated = await apiRequest(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: formattedName,
          email: form.email.trim(),
          phone: form.phone,
        }),
      });

      const record = updated?.data || updated || {};
      const newUser = {
        ...user,
        fullName: formatFullName(record.fullName ?? formattedName),
        email: record.email ?? form.email.trim(),
        phone: record.phone ?? form.phone,
      };

      localStorage.setItem("dinoraUser", JSON.stringify(newUser));
      setForm({
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
      });
      window.dispatchEvent(new Event("dinora-auth-updated"));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update profile. Check that PUT /api/users/{userId} exists.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AccountLayout title="My Profile" subtitle="Your personal details">
      <h2 className="d-panel-title">Personal Information</h2>
      <p className="d-panel-subtitle">Update the details associated with your DIANORA account.</p>

      {message && <div className="d-account-alert">{message}</div>}
      {error && <div className="d-account-alert error">{error}</div>}

      <form onSubmit={save}>
        <div className="d-form-grid">
          <div className="d-form-field">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={change}
              onBlur={formatNameOnBlur}
              required
              maxLength={100}
            />
          </div>

          <div className="d-form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              maxLength={150}
            />
          </div>

          <div className="d-form-field full">
            <label htmlFor="phone">Mobile Number (OTP login)</label>
            <input id="phone" name="phone" value={form.phone} readOnly />
            <small style={{ color: "#81756c" }}>
              Mobile number is your login identity and cannot be edited here.
            </small>
          </div>
        </div>

        <div className="d-form-actions">
          <button className="d-account-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}

