import { Link, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./OrderSuccess.css";

const API_BASE_URL = "http://localhost:8080/api";

function formatRupees(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function OrderSuccess() {
  const location = useLocation();
  const navigationOrder = location.state?.order || null;
  const storedOrderId = sessionStorage.getItem("dinoraLastOrderId");
  const orderId = navigationOrder?.id || storedOrderId || null;

  const [order, setOrder] = useState(navigationOrder);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  // Fetch the persisted order from backend. This also lets the page survive refresh.
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchOrder() {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!response.ok) {
          throw new Error(`Could not load order details (HTTP ${response.status})`);
        }
        const backendOrder = await response.json();
        if (!cancelled) {
          sessionStorage.setItem("dinoraLastOrderId", String(orderId));
          setOrder({ ...backendOrder, paymentMethod: navigationOrder?.paymentMethod || "COD" });
          setError("");
        }
      } catch (e) {
        // Keep the create-order response details if the follow-up GET is unavailable.
        if (!cancelled) {
          setOrder(navigationOrder);
          setError(e.message || "Unable to load order details from backend.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!order) {
    return <Navigate to="/allProducts" replace />;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const fullName = order.shippingFullName || order.customer?.fullName || "—";
  const phone = order.shippingPhone || order.customer?.phone || "—";
  const addressLine1 = order.shippingAddressLine1 || order.customer?.address || "";
  const addressLine2 = order.shippingAddressLine2 || "";
  const city = order.shippingCity || order.customer?.city || "";
  const state = order.shippingState || order.customer?.state || "";
  const country = order.shippingCountry || "India";
  const postalCode = order.shippingPostalCode || order.customer?.pinCode || "";

  const subtotal = order.subtotalAmount ?? order.subtotal ?? items.reduce(
    (sum, item) => sum + Number(item.subtotal ?? (Number(item.unitPrice ?? item.price) * Number(item.quantity))),
    0
  );
  const discount = Number(order.discountAmount ?? order.discount ?? 0);
  const total = order.totalAmount ?? order.total ?? (Number(subtotal) - discount);

  return (
    <main className="order-success-page">
      <section className="order-success-card">
        <div className="order-success-check">✓</div>

        <p className="order-success-eyebrow">THANK YOU FOR CHOOSING DIANORA</p>
        <h1>Order Placed!</h1>
        <p className="order-success-description">
          Your order has been saved successfully. We will process your delivery shortly.
        </p>

        {error && <p className="order-success-description" role="status">{error}</p>}
        {loading && <p className="order-success-description">Loading order details…</p>}

        <div className="order-success-number">
          <span>Order Reference</span>
          <strong>{order.orderNumber || order.id}</strong>
        </div>

        <div className="order-success-details">
          <div>
            <span>Customer</span>
            <strong>{fullName}</strong>
          </div>
          <div>
            <span>Mobile Number</span>
            <strong>{phone === "—" ? phone : `+91 ${phone}`}</strong>
          </div>
          <div>
            <span>Payment Method</span>
            <strong>{order.paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery"}</strong>
          </div>
          <div>
            <span>Order Total</span>
            <strong>{formatRupees(total)}</strong>
          </div>
          <div>
            <span>Order Status</span>
            <strong>{order.status || "PLACED"}</strong>
          </div>
        </div>

        <div className="order-success-address">
          <h2>Delivery Address</h2>
          <p>{fullName}</p>
          {addressLine1 && <p>{addressLine1}</p>}
          {addressLine2 && <p>{addressLine2}</p>}
          <p>{[city, state].filter(Boolean).join(", ")}{postalCode ? ` - ${postalCode}` : ""}</p>
          {country && <p>{country}</p>}
          <p>Mobile: {phone}</p>
        </div>

        <div className="order-success-products">
          <h2>Order Summary</h2>
          {items.length === 0 ? (
            <p>Order items are not available.</p>
          ) : items.map((item) => {
            const itemName = item.productName || item.name || "Product";
            const quantity = Number(item.quantity || 0);
            const itemSubtotal = item.subtotal ?? (Number(item.unitPrice ?? item.price) * quantity);
            return (
              <div className="order-success-product" key={item.id || item.productId || itemName}>
                <span>{itemName} × {quantity}</span>
                <strong>{formatRupees(itemSubtotal)}</strong>
              </div>
            );
          })}

          <div className="order-success-product">
            <span>Subtotal</span>
            <strong>{formatRupees(subtotal)}</strong>
          </div>
          {discount > 0 && (
            <div className="order-success-product">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <strong>-{formatRupees(discount)}</strong>
            </div>
          )}
          <div className="order-success-product">
            <span>Total</span>
            <strong>{formatRupees(total)}</strong>
          </div>
        </div>

        <Link to="/allProducts" className="order-success-button">
          CONTINUE SHOPPING
        </Link>
      </section>
    </main>
  );
}

export default OrderSuccess;
