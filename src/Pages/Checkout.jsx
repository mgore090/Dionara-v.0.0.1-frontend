import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_BASE_URL = "http://localhost:8080/api";
const CART_KEY = "dinoraCart";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [step, setStep] = useState(1);

  // Temporary demo OTP. Replace with MSG91 integration later.
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState(null);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    addressType: "HOME",
    defaultAddress: true,
  });

  const [savedAddress, setSavedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Load cart and restore the existing customer session if available.
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      setCartItems(Array.isArray(cart) ? cart.filter(
        (item) => item && item.id != null &&
          Number(item.price) >= 0 && Number(item.quantity) > 0
      ) : []);
    } catch (err) {
      console.error("Cart loading error:", err);
      setCartItems([]);
    } finally {
      setCartLoaded(true);
    }

    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("dinoraUser") || "null");
    } catch (err) {
      console.error("Saved customer session parsing error:", err);
    }

    if (storedUser?.id || storedUser?.userId) {
      const customerId = storedUser.id ?? storedUser.userId;
      const loggedInUser = {
        ...storedUser,
        id: customerId,
        fullName: storedUser.fullName || "",
        phone: storedUser.phone || "",
      };

      setUser(loggedInUser);
      setPhone(loggedInUser.phone);
      setAddress((current) => ({
        ...current,
        fullName: loggedInUser.fullName,
        phone: loggedInUser.phone,
      }));
      setVerified(true);
      setStep(2);

      loadCustomerAddresses(customerId).catch((err) => {
        console.error("Saved session address loading error:", err);
        setSavedAddresses([]);
        setSavedAddress(null);
        setShowAddressForm(true);
        setError(err.message || "Could not load saved addresses. Please add an address.");
      });
    }
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity), 0
    ),
    [cartItems]
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const formatPrice = (value) => Number(value).toLocaleString("en-IN");

  async function readResponse(response) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed (${response.status})`);
    }
    return data;
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await readResponse(response);
      setAddress((current) => ({ ...current, phone }));
      setOtpSent(true);
      setSuccess(data.message || "OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerAddresses(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/addresses`);
    const data = await readResponse(response);
    const list = Array.isArray(data) ? data : [];
    setSavedAddresses(list);

    if (list.length > 0) {
      const defaultAddress = list.find((item) => item.defaultAddress) || list[0];
      setSavedAddress(defaultAddress);
      setShowAddressForm(false);
    } else {
      setSavedAddress(null);
      setShowAddressForm(true);
    }
    return list;
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await readResponse(response);
      const customer = data.user || data.customer || data;
      const customerId = customer.id ?? customer.userId ?? data.userId;

      if (!customerId) {
        throw new Error("OTP verified, but backend did not return a customer ID. Check OTP verify response.");
      }

      const loggedInUser = {
        id: customerId,
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || phone,
        active: customer.active !== false,
      };

      localStorage.setItem("dinoraUser", JSON.stringify(loggedInUser));
      localStorage.removeItem("dinoraDemoUser");
      localStorage.removeItem("dinoraDemoAddress");
      setUser(loggedInUser);
      setVerified(true);
      setOtp("");
      setOtpSent(false);

      // Fetch this customer's saved addresses immediately after login.
      await loadCustomerAddresses(loggedInUser.id);
      setStep(2);
      setSuccess("Mobile number verified successfully.");
    } catch (err) {
      console.error("OTP verification/address loading error:", err);
      setError(err.message || "Unable to verify OTP or load saved addresses.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddressChange(event) {
    const { name, value } = event.target;
    setAddress((current) => ({
      ...current,
      [name]: name === "postalCode"
        ? value.replace(/\D/g, "").slice(0, 6)
        : value,
    }));
  }

  async function handleSaveAddress(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!verified || !user?.id) {
      setError("Please verify your mobile number first.");
      setStep(1);
      return;
    }
    if (!address.fullName.trim()) {
      setError("Enter recipient name.");
      return;
    }
    if (!address.addressLine1.trim() || !address.addressLine2.trim()) {
      setError("Enter your building name and road/area.");
      return;
    }
    if (!/^\d{6}$/.test(address.postalCode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }
    if (!address.city.trim() || !address.state.trim()) {
      setError("Enter city and state.");
      return;
    }

    const payload = {
      ...address,
      fullName: address.fullName.trim(),
      phone,
      addressLine1: address.addressLine1.trim(),
      addressLine2: address.addressLine2.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      country: "India",
      addressType: "HOME",
      defaultAddress: savedAddresses.length === 0,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await readResponse(response);
      if (!created.id) throw new Error("Address ID was not returned by backend.");

      const refreshed = await loadCustomerAddresses(user.id);
      const selected = refreshed.find((item) => String(item.id) === String(created.id)) || created;
      setSavedAddress(selected);
      setShowAddressForm(false);
      setStep(3);
      setSuccess("Address saved successfully.");
    } catch (err) {
      console.error("Address save error:", err);
      setError(err.message || "Unable to save address.");
    } finally {
      setLoading(false);
    }
  }

  function continueWithSelectedAddress() {
    if (!savedAddress?.id) {
      setError("Please select a delivery address.");
      return;
    }
    setError("");
    setShowAddressForm(false);
    setStep(3);
  }

  function startAddingAddress() {
    setAddress({
      fullName: user?.fullName || "",
      phone: user?.phone || phone,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      addressType: "HOME",
      defaultAddress: savedAddresses.length === 0,
    });
    setShowAddressForm(true);
    setError("");
  }

  async function handlePlaceOrder() {
    setError("");
    if (paymentMethod === "ONLINE") {
      setError("Online payment gateway is not integrated yet. Please select Cash on Delivery for now.");
      return;
    }
    if (!verified || !user?.id) {
      setError("Customer login is not complete. Please verify your mobile number again.");
      return;
    }
    if (!savedAddress?.id || cartItems.length === 0) {
      setError("Address or cart details are missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(user.id),
          addressId: Number(savedAddress.id),
          items: cartItems.map((item) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity),
          })),
          couponCode: null,
        }),
      });
      const order = await readResponse(response);
      localStorage.removeItem(CART_KEY);
      navigate("/order-success", { state: { order: { ...order, paymentMethod } } });
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message || "Unable to place your order.");
    } finally {
      setLoading(false);
    }
  }

  if (!cartLoaded) {
    return <main className="checkout-page"><p className="checkout-loading">Loading checkout...</p></main>;
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h2>Your bag is empty</h2>
          <p>Add a product before proceeding to checkout.</p>
          <Link to="/allProducts" className="checkout-button">CONTINUE SHOPPING</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-topbar">
        <Link to="/cart" className="checkout-back"><span>←</span> Checkout</Link>
        <Link to="/" className="checkout-logo">DIANORA</Link>
      </header>

      <section className="checkout-progress">
        {[
          { number: 1, label: "Login" },
          { number: 2, label: "Address" },
          { number: 3, label: "Payment" },
        ].map((item) => (
          <div
            className={`checkout-progress-step ${step >= item.number ? "active" : ""}`}
            key={item.number}
          >
            <div className="checkout-step-circle">
              {step > item.number ? "✓" : item.number}
            </div>
            <strong>{item.label}</strong>
          </div>
        ))}
      </section>

      <section className="checkout-content">
        <div className="checkout-bag">
          <h2>Bag</h2>
          {cartItems.map((item) => (
            <div className="checkout-bag-item" key={item.id}>
              <div className="checkout-bag-image">
                {item.image ? <img src={item.image} alt={item.name || "Product"} /> : <span>No image</span>}
              </div>
              <div className="checkout-bag-details">
                <h3>{item.name}</h3>
                <p>Qty: {item.quantity}</p>
                <strong>₹{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
              </div>
            </div>
          ))}
          <div className="checkout-price-row"><span>Subtotal</span><span>₹{formatPrice(subtotal)}</span></div>
          <div className="checkout-price-row"><span>Shipping</span><span>FREE</span></div>
          <div className="checkout-price-total"><strong>Total</strong><strong>₹{formatPrice(total)}</strong></div>
        </div>

        <div className="checkout-action-panel">
          {error && <div className="checkout-message checkout-error">{error}</div>}
          {success && <div className="checkout-message checkout-success">{success}</div>}

          {step === 1 && (
            <section className="checkout-step-panel">
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                <label htmlFor="checkout-phone">Enter Mobile No*</label>
                <div className="checkout-mobile-input">
                  <span className="checkout-whatsapp">●</span>
                  <span>+91</span>
                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter Mobile No*"
                    value={phone}
                    maxLength={10}
                    disabled={otpSent}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                  />
                </div>

                {otpSent && (
                  <>
                    <label htmlFor="checkout-otp">Enter OTP*</label>
                    <input
                      id="checkout-otp"
                      className="checkout-text-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />

                  </>
                )}

                <button type="submit" className="checkout-continue-button" disabled={loading}>
                  {otpSent ? "VERIFY OTP & CONTINUE" : "CONTINUE"}
                </button>
              </form>

              {otpSent && (
                <>
                  <button type="button" className="checkout-resend-button" onClick={handleSendOtp}>
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    className="checkout-back-step"
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); setSuccess(""); }}
                  >
                    Change Mobile Number
                  </button>
                </>
              )}

              <p className="checkout-terms">
                By proceeding, I agree to the <Link to="/terms">T&C</Link> &{" "}
                <Link to="/privacy-policy">Privacy Policy</Link>
              </p>
              <p className="checkout-powered">Secure checkout by DIANORA</p>
            </section>
          )}

          {step === 2 && (
            <section className="checkout-step-panel">
              {!showAddressForm && savedAddresses.length > 0 && (
                <>
                  <h2>Select Delivery Address</h2>
                  <p>Choose where you want your order delivered.</p>
                  <div className="checkout-saved-addresses">
                    {savedAddresses.map((item) => (
                      <label
                        key={item.id}
                        className={`checkout-delivery-card ${String(savedAddress?.id) === String(item.id) ? "selected" : ""}`}
                        style={{ display: "block", cursor: "pointer", marginBottom: "12px", padding: "14px", border: String(savedAddress?.id) === String(item.id) ? "2px solid #111" : "1px solid #ddd" }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={String(savedAddress?.id) === String(item.id)}
                            onChange={() => setSavedAddress(item)}
                          />
                          <div>
                            <strong>{item.fullName}</strong>
                            {item.defaultAddress && <span style={{ marginLeft: "8px", fontSize: "12px" }}>DEFAULT</span>}
                            <p>{item.addressLine1}, {item.addressLine2}</p>
                            <p>{item.city}, {item.state} - {item.postalCode}</p>
                            <p>Mobile: {item.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button type="button" className="checkout-continue-button" onClick={continueWithSelectedAddress}>
                    DELIVER TO THIS ADDRESS
                  </button>
                  <button type="button" className="checkout-resend-button" onClick={startAddingAddress}>
                    + ADD NEW ADDRESS
                  </button>
                </>
              )}

              {showAddressForm && (
                <>
                  <h2>{savedAddresses.length > 0 ? "Add New Address" : "Delivery Address"}</h2>
                  <form onSubmit={handleSaveAddress}>
                    <label htmlFor="fullName">Full Name*</label>
                    <input
                      id="fullName"
                      className="checkout-text-input"
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      placeholder="Enter recipient name"
                      maxLength={100}
                      autoComplete="name"
                      required
                    />

                    <label htmlFor="addressLine1">House No./ Building Name*</label>
                    <input
                      id="addressLine1"
                      className="checkout-text-input"
                      type="text"
                      name="addressLine1"
                      value={address.addressLine1}
                      onChange={handleAddressChange}
                      placeholder="Enter House No./ Building Name"
                      maxLength={255}
                      autoComplete="address-line1"
                      required
                    />

                    <label htmlFor="addressLine2">Road Name / Area Colony*</label>
                    <input
                      id="addressLine2"
                      className="checkout-text-input"
                      type="text"
                      name="addressLine2"
                      value={address.addressLine2}
                      onChange={handleAddressChange}
                      placeholder="Enter Road Name / Area Colony"
                      maxLength={255}
                      autoComplete="address-line2"
                      required
                    />

                    <label htmlFor="postalCode">Pincode*</label>
                    <input
                      id="postalCode"
                      className="checkout-text-input"
                      type="text"
                      name="postalCode"
                      inputMode="numeric"
                      value={address.postalCode}
                      onChange={handleAddressChange}
                      placeholder="Enter 6-digit Pincode"
                      maxLength={6}
                      autoComplete="postal-code"
                      required
                    />

                    <div className="checkout-address-grid">
                      <div>
                        <label htmlFor="city">City*</label>
                        <input id="city" className="checkout-text-input" type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="Enter City" maxLength={100} autoComplete="address-level2" required />
                      </div>
                      <div>
                        <label htmlFor="state">State*</label>
                        <input id="state" className="checkout-text-input" type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="Enter State" maxLength={100} autoComplete="address-level1" required />
                      </div>
                    </div>

                    <button type="submit" className="checkout-continue-button" disabled={loading}>
                      {loading ? "PLEASE WAIT..." : "SAVE ADDRESS & CONTINUE"}
                    </button>
                  </form>
                  {savedAddresses.length > 0 && (
                    <button type="button" className="checkout-back-step" onClick={() => { setShowAddressForm(false); setError(""); }}>
                      ← Back to Saved Addresses
                    </button>
                  )}
                </>
              )}

              <button type="button" className="checkout-back-step" onClick={() => { setError(""); setSuccess(""); setStep(1); }}>
                ← Back to Login
              </button>
              <p className="checkout-terms">
                By proceeding, I agree to the <Link to="/terms">T&C</Link> &{" "}
                <Link to="/privacy-policy">Privacy Policy</Link>
              </p>
              <p className="checkout-powered">Secure checkout by DIANORA</p>
            </section>
          )}

          {step === 3 && (
            <section className="checkout-step-panel checkout-payment-page">
              <div className="checkout-payment-heading">
                <h2>Payment Method</h2>
                <span className="checkout-safe-payments">
                  <span className="checkout-safe-icon">✓</span>
                  <span>100% SAFE<br />PAYMENTS</span>
                </span>
              </div>

              <div className="checkout-payment-methods">
                <label className={`checkout-payment-choice ${paymentMethod === "ONLINE" ? "selected" : ""}`}>
                  <input type="radio" name="paymentMethod" value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(event) => setPaymentMethod(event.target.value)} />
                  <span className="checkout-payment-choice-content">
                    <strong>Pay Online</strong>
                    <small>UPI, Cards, Net Banking & Wallets</small>
                  </span>
                  <span className="checkout-payment-tag">SECURE</span>
                </label>

                <label className={`checkout-payment-choice ${paymentMethod === "COD" ? "selected" : ""}`}>
                  <input type="radio" name="paymentMethod" value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) => setPaymentMethod(event.target.value)} />
                  <span className="checkout-payment-choice-content">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order is delivered.</small>
                  </span>
                </label>
              </div>

              <div className="checkout-offers-banner">
                <span className="checkout-offer-icon">%</span>
                <span>
                  <strong>Offers & discounts</strong>
                  <small>Check available offers at checkout</small>
                </span>
                <span className="checkout-offer-label">OFFERS</span>
              </div>

              <div className="checkout-bill-details">
                <h3>Bill Details</h3>
                <div>
                  <span>Items</span>
                  <span>{cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
                </div>
                <div><span>Item total</span><span>₹{formatPrice(subtotal)}</span></div>
                <div><span>Delivery fee</span><span>{shipping === 0 ? "₹0" : `₹${formatPrice(shipping)}`}</span></div>
                <div className="checkout-bill-total">
                  <strong>Total amount</strong>
                  <strong>₹{formatPrice(total)}</strong>
                </div>
              </div>

              <div className="checkout-savings-note">
                <span>✓</span>
                <strong>Free delivery on this order</strong>
              </div>

              <div className="checkout-delivery-section">
                <h2>Delivery Address</h2>
                <div className="checkout-delivery-card">
                  <div className="checkout-delivery-card-main">
                    <div className="checkout-delivery-name-row">
                      <strong>{savedAddress?.fullName}</strong>
                      <button type="button" onClick={() => { setError(""); setShowAddressForm(false); setStep(2); }}>
                        CHANGE
                      </button>
                    </div>
                    <p>
                      {savedAddress?.addressLine1}, {savedAddress?.addressLine2},{" "}
                      {savedAddress?.city}, {savedAddress?.state}, {savedAddress?.postalCode}
                    </p>
                    <p>Mobile: {savedAddress?.phone}</p>
                  </div>
                  <div className="checkout-delivery-promise">
                    🚚 Delivery within 3-6 days
                  </div>
                </div>
              </div>

              <div className="checkout-benefits">
                <div><span className="checkout-benefit-icon">₹</span><small>Best Value</small></div>
                <div><span className="checkout-benefit-icon">📦</span><small>Safe Packaging</small></div>
                <div><span className="checkout-benefit-icon">✓</span><small>Quality Assured</small></div>
              </div>

              <div className="checkout-payment-bottom">
                <div className="checkout-payment-bottom-total">
                  <small>Total amount</small>
                  <strong>₹{formatPrice(total)}</strong>
                </div>
                <button type="button" className="checkout-pay-button"
                  onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "PLEASE WAIT..." : paymentMethod === "ONLINE" ? "PAY ONLINE" : "PLACE ORDER"}
                </button>
              </div>

              <p className="checkout-powered">Powered by DIANORA</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}