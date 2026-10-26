
import { Link, useLocation, Navigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();

  let order = location.state?.order;

  if (!order) {
    try {
      const orders = JSON.parse(
        localStorage.getItem("dinoraOrders") || "[]"
      );

      if (Array.isArray(orders) && orders.length > 0) {
        order = orders[0];
      }
    } catch {
      order = null;
    }
  }

  if (!order) {
    return <Navigate to="/allProducts" replace />;
  }

  return (
    <main className="order-success-page">
      <section className="order-success-card">
        <div className="order-success-check">✓</div>

        <p className="order-success-eyebrow">
          THANK YOU FOR CHOOSING DIANORA
        </p>

        <h1>Order Placed!</h1>

        <p className="order-success-description">
          Your demo order has been saved in this browser.
          This is not yet a confirmed shipment.
        </p>

        <div className="order-success-number">
          <span>Order Reference</span>
          <strong>{order.id}</strong>
        </div>

        <div className="order-success-details">
          <div>
            <span>Customer</span>
            <strong>{order.customer?.fullName}</strong>
          </div>

          <div>
            <span>Mobile Number</span>
            <strong>+91 {order.customer?.phone}</strong>
          </div>

          <div>
            <span>Payment Method</span>
            <strong>
              {order.paymentMethod === "COD"
                ? "Cash on Delivery (Demo)"
                : order.paymentMethod}
            </strong>
          </div>

          <div>
            <span>Order Total</span>
            <strong>
              ₹{Number(order.total || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="order-success-address">
          <h2>Delivery Address</h2>

          <p>{order.customer?.fullName}</p>
          <p>{order.customer?.address}</p>
          <p>
            {order.customer?.city}, {order.customer?.state} -{" "}
            {order.customer?.pinCode}
          </p>
        </div>

        <div className="order-success-products">
          <h2>Order Summary</h2>

          {(order.items || []).map((item) => (
            <div
              className="order-success-product"
              key={item.id}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                ₹
                {(
                  Number(item.price) * Number(item.quantity)
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}
        </div>

        <Link
          to="/allProducts"
          className="order-success-button"
        >
          CONTINUE SHOPPING
        </Link>
      </section>
    </main>
  );
}

export default OrderSuccess;
