
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";

const CART_KEY = "dinoraCart";
const ORDERS_KEY = "dinoraOrders";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Maharashtra",
    pinCode: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      setCartItems(
        Array.isArray(savedCart)
          ? savedCart.filter(
              (item) =>
                item &&
                item.id != null &&
                Number(item.price) >= 0 &&
                Number(item.quantity) > 0
            )
          : []
      );
    } catch {
      setCartItems([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price) * Number(item.quantity),
        0
      ),
    [cartItems]
  );

  const shipping = 0;
  const total = subtotal + shipping;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "phone" || name === "pinCode"
          ? value.replace(/\D/g, "").slice(
              0,
              name === "phone" ? 10 : 6
            )
          : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add a product first.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (!form.fullName.trim() || !form.address.trim() ||
        !form.city.trim() || !form.state.trim()) {
      setError("Please fill in all required delivery details.");
      return;
    }

    setSubmitting(true);

    try {
      const savedOrders = JSON.parse(
        localStorage.getItem(ORDERS_KEY) || "[]"
      );

      if (!Array.isArray(savedOrders)) {
        throw new Error("Invalid order data");
      }

      const order = {
        id: `DNR-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone,
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pinCode: form.pinCode,
        },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          quantity: Number(item.quantity),
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: form.paymentMethod,
        status: "Order placed (demo)",
      };

      // Save a demo order in this browser only.
      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([order, ...savedOrders])
      );

      localStorage.removeItem(CART_KEY);

      navigate("/order-success", {
        state: { order },
      });
    } catch (err) {
      console.error("Unable to place order:", err);
      setError(
        "We couldn't save your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!cartLoaded) {
    return (
      <main className="checkout-page">
        <p>Loading checkout...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add products before proceeding to checkout.</p>
          <Link to="/allProducts" className="checkout-primary-button">
            CONTINUE SHOPPING
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <p className="checkout-eyebrow">DIANORA SKIN CARE</p>
        <h1>Checkout</h1>
        <p>Almost there. Complete your delivery details below.</p>
      </header>

      <div className="checkout-breadcrumb">
        <Link to="/allProducts">Shop</Link>
        <span>/</span>
        <Link to="/cart">Cart</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <section className="checkout-form-section">
          <div className="checkout-section-heading">
            <span>01</span>
            <h2>Delivery Information</h2>
          </div>

          <div className="checkout-fields">
            <div className="checkout-field checkout-full-width">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Mobile Number *</label>
              <div className="checkout-phone-field">
                <span>+91</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="checkout-field">
              <label htmlFor="email">Email (optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                maxLength={150}
              />
            </div>

            <div className="checkout-field checkout-full-width">
              <label htmlFor="address">Full Address *</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
                placeholder="House number, street, area, landmark"
                rows={4}
                maxLength={500}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="city">City / Town *</label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                autoComplete="address-level2"
                placeholder="Enter city or town"
                maxLength={100}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="state">State *</label>
              <input
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                autoComplete="address-level1"
                placeholder="Enter state"
                maxLength={100}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="pinCode">PIN Code *</label>
              <input
                id="pinCode"
                name="pinCode"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.pinCode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="checkout-section-heading checkout-payment-heading">
            <span>02</span>
            <h2>Payment Method</h2>
          </div>

          <label className="checkout-payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={form.paymentMethod === "COD"}
              onChange={handleChange}
            />
            <span>
              <strong>Cash on Delivery (COD)</strong>
              <small>Pay when your order is delivered.</small>
            </span>
          </label>

          <p className="checkout-payment-note">
            Online payment is not enabled yet. COD selection here
            is a demo and does not arrange shipment automatically.
          </p>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="checkout-primary-button checkout-place-order"
            disabled={submitting}
          >
            {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>

          <Link to="/cart" className="checkout-back-link">
            ← Back to Cart
          </Link>
        </section>

        <aside className="checkout-summary">
          <h2>Your Order</h2>

          <div className="checkout-summary-items">
            {cartItems.map((item) => (
              <div
                className="checkout-summary-item"
                key={item.id}
              >
                <div className="checkout-summary-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>No image</span>
                  )}
                  <span className="checkout-item-quantity">
                    {item.quantity}
                  </span>
                </div>

                <div className="checkout-summary-product">
                  <p>{item.name}</p>
                  <span>Qty: {item.quantity}</span>
                </div>

                <strong>
                  ₹
                  {(
                    Number(item.price) * Number(item.quantity)
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>₹{shipping}</span>
          </div>

          <div className="checkout-summary-total">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>

          <p className="checkout-summary-note">
            Please review your delivery address and order details
            before placing your order.
          </p>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;
