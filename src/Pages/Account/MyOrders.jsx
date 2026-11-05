// import React, { useEffect, useState } from "react";
// import AccountLayout from "./AccountLayout";
// import { apiRequest, getLoggedInUser } from "./accountCommon";
// import "./MyOrdersDetails.css";

// const money = (value) => {
//   const amount = Number(value);
//   return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : "₹0.00";
// };
// const label = (value) => String(value || "PLACED").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// function OrderDetails({ order, onClose, onReturn }) {
//   const status = String(order.status || "PLACED").toUpperCase();
//   const steps = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED","RETURNED"];
//   const current = steps.indexOf(status);
//   const canReturn = status === "DELIVERED";
//   const address = [
//     order.shippingFullName,
//     order.shippingPhone,
//     order.shippingAddressLine1,
//     order.shippingAddressLine2,
//     order.shippingCity,
//     order.shippingState,
//     order.shippingCountry,
//     order.shippingPostalCode,
//   ].filter(Boolean);

//   return <div className="d-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
//     <section className="d-order-detail-modal" role="dialog" aria-modal="true" aria-label="Order details">
//       <header className="d-detail-header">
//         <div><small>ORDER DETAILS</small><h2>#{order.orderNumber || order.id}</h2><p>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date not available"}</p></div>
//         <button className="d-detail-close" onClick={onClose} aria-label="Close details">×</button>
//       </header>
//       <div className="d-detail-content">
//         <div className="d-detail-status"><strong>Status: {label(status)}</strong>
//           {status !== "CANCELLED" && <div className="d-status-timeline">{steps.map((step, i) => <div className={`d-timeline-step ${current >= i ? "active" : ""}`} key={step}><span className="d-timeline-dot"/><small>{label(step)}</small></div>)}</div>}
//         </div>
//         <section className="d-detail-section"><h3>Products</h3>
//           {(order.items || []).map((item, i) => <div className="d-detail-product" key={item.id || i}>
//             <div><strong>{item.productName || item.name || `Product ${item.productId || ""}`}</strong><small>Qty: {item.quantity ?? 1} × {money(item.unitPrice ?? item.price)}</small></div>
//             <strong>{money(item.subtotal ?? Number(item.unitPrice ?? item.price) * Number(item.quantity ?? 1))}</strong>
//           </div>)}
//         </section>
//         <section className="d-detail-section"><h3>Price Summary</h3>
//           <div className="d-detail-row"><span>Subtotal</span><span>{money(order.subtotalAmount ?? order.totalAmount)}</span></div>
//           <div className="d-detail-row"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>- {money(order.discountAmount)}</span></div>
//           <div className="d-detail-row total"><strong>Order Total</strong><strong>{money(order.totalAmount)}</strong></div>
//         </section>
//         <section className="d-detail-section"><h3>Delivery Address</h3>
//           {address.length ? <address>{address.map((line, i) => <span key={i}>{line}</span>)}</address> : <p>Address details are not available in this order record.</p>}
//         </section>
//         <section className="d-detail-section"><h3>Payment</h3>
//           <div className="d-detail-row"><span>Payment Method</span><span>{order.paymentMethod || "Cash on Delivery"}</span></div>
//           <div className="d-detail-row"><span>Payment Status</span><span>{order.paymentStatus || (String(order.paymentMethod || "").toUpperCase().includes("COD") ? "Pending" : "Not available")}</span></div>
//         </section>
//         {canReturn && <button className="d-return-button" onClick={() => onReturn(order)}>Request Return</button>}
//         {status === "CANCELLED" && <p className="d-return-note">This order was cancelled. Return is not available.</p>}
//       </div>
//     </section>
//   </div>;
// }

// function ReturnRequest({ order, onClose, onSubmit }) {
//   const items = order.items || [];
//   const [itemId, setItemId] = useState(String(items[0]?.id ?? ""));
//   const [quantity, setQuantity] = useState(1);
//   const [reason, setReason] = useState("");
//   const [description, setDescription] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState("");

//   async function submit(e) {
//     e.preventDefault();
//     setError("");
//     if (!itemId || !reason) { setError("Select a product and return reason."); return; }
//     setBusy(true);
//     try {
//       await onSubmit({ orderId: order.id, orderItemId: Number(itemId), quantity: Number(quantity), reason, description });
//       onClose();
//     } catch (err) { setError(err.message || "Return request could not be submitted."); }
//     finally { setBusy(false); }
//   }

//   return <div className="d-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
//     <section className="d-order-detail-modal d-return-modal" role="dialog" aria-modal="true" aria-label="Return request">
//       <header className="d-detail-header"><div><small>RETURN REQUEST</small><h2>Order #{order.orderNumber || order.id}</h2></div><button className="d-detail-close" onClick={onClose}>×</button></header>
//       <form className="d-detail-content" onSubmit={submit}>
//         <label>Product<select value={itemId} onChange={(e) => { setItemId(e.target.value); setQuantity(1); }} required>{items.map((item) => <option key={item.id} value={item.id}>{item.productName || item.name} (ordered {item.quantity})</option>)}</select></label>
//         <label>Return Quantity<input type="number" min="1" max={items.find((x) => String(x.id) === itemId)?.quantity || 1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></label>
//         <label>Reason<select value={reason} onChange={(e) => setReason(e.target.value)} required><option value="">Choose a reason</option><option>Damaged product</option><option>Wrong product received</option></select></label>
//         <label>Additional details<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" maxLength="1000" placeholder="Tell us more (optional)" /></label>
//         {error && <div className="d-account-alert error">{error}</div>}
//         <p className="d-return-note">Your request will be reviewed by Dianora. Refund is not issued until the return is approved and processed.</p>
//         <button className="d-return-button" disabled={busy}>{busy ? "Submitting..." : "Submit Return Request"}</button>
//       </form>
//     </section>
//   </div>;
// }

// export default function MyOrders() {
//   const user = getLoggedInUser();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [returnOrder, setReturnOrder] = useState(null);
//   const [notice, setNotice] = useState("");

//   useEffect(() => {
//     if (!user?.id) { setLoading(false); setError("Please login again to view orders."); return; }
//     apiRequest(`/orders/user/${user.id}`).then((data) => setOrders(Array.isArray(data) ? data : data?.content || data?.data || []))
//       .catch((err) => setError(err.message || "Unable to load orders."))
//       .finally(() => setLoading(false));
//   }, []);

//   async function submitReturn(payload) {
//     if (!user?.id) {
//       throw new Error("Your customer account ID is missing. Please log out and log in again.");
//     }

//     const returnPayload = {
//       userId: Number(user.id),
//       orderId: Number(payload.orderId),
//       orderItemId: Number(payload.orderItemId),
//       quantity: Number(payload.quantity),
//       reason: payload.reason,
//       additionalDetails: payload.description || ""
//     };

//     await apiRequest("/returns", {
//       method: "POST",
//       body: JSON.stringify(returnPayload)
//     });

//     setNotice("Return request submitted. You can track its status from order details.");
//   }

//   return <AccountLayout title="My Orders" subtitle="Your order history and status">
//     <h2 className="d-panel-title">Order History</h2><p className="d-panel-subtitle">Select an order to view all details, delivery address and available actions.</p>
//     {notice && <div className="d-account-alert success">{notice}</div>}
//     {loading ? <div className="d-loading">Loading your orders...</div> : error ? <div className="d-account-alert error">{error}</div> : orders.length === 0 ? <div className="d-loading">You haven't placed any orders yet.</div> : orders.map((order) => (
//       <article className="d-order-card d-order-clickable" key={order.id ?? order.orderNumber} onClick={() => setSelected(order)} tabIndex="0" role="button" onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(order)}>
//         <div className="d-order-head"><div><strong>Order #{order.orderNumber ?? order.id}</strong><div className="d-order-date">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date not available"}</div></div><span className="d-order-status">{label(order.status)}</span></div>
//         <div className="d-order-body">
//           {(order.items || []).map((item, index) => <div className="d-order-line" key={item.id ?? index}><span>{item.productName || item.name || `Product ${item.productId || ""}`} × {item.quantity || 1}</span><strong>{money(item.subtotal ?? Number(item.unitPrice ?? item.price) * Number(item.quantity || 1))}</strong></div>)}
//           <div className="d-order-line d-order-total"><strong>Total</strong><strong>{money(order.totalAmount ?? order.total ?? order.subtotalAmount)}</strong></div>
//           <div className="d-order-footer"><span>Payment: {order.paymentMethod || "Cash on Delivery"}</span><span>View full details →</span></div>
//         </div>
//       </article>
//     ))}
//     {selected && <OrderDetails order={selected} onClose={() => setSelected(null)} onReturn={(order) => { setSelected(null); setReturnOrder(order); }} />}
//     {returnOrder && <ReturnRequest order={returnOrder} onClose={() => setReturnOrder(null)} onSubmit={submitReturn} />}
//   </AccountLayout>;
// }



import React, { useEffect, useState } from "react";
import AccountLayout from "./AccountLayout";
import { apiRequest, getLoggedInUser } from "./accountCommon";
import "./MyOrdersDetails.css";

const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : "₹0.00";
};
const label = (value) => String(value || "PLACED").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function OrderDetails({ order, onClose, onReturn, returnRequests = [], userId }) {
  const status = String(order.status || "PLACED").toUpperCase();
  const steps = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED","RETURNED"];
  const current = steps.indexOf(status);
  const canReturn = status === "DELIVERED";
  const activeReturnStatuses = ["REQUESTED", "APPROVED", "PICKUP_SCHEDULED", "RECEIVED", "REFUND_PROCESSING", "REFUNDED"];
  const returnedQuantities = returnRequests.reduce((map, request) => {
    if (activeReturnStatuses.includes(String(request.status || "").toUpperCase())) {
      const key = String(request.orderItemId);
      map[key] = (map[key] || 0) + Number(request.returnQuantity || request.quantity || 0);
    }
    return map;
  }, {});
  const canRequestMore = (order.items || []).some((item) =>
    Number(item.quantity || 0) > (returnedQuantities[String(item.id)] || 0)
  );
  const address = [
    order.shippingFullName,
    order.shippingPhone,
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingCity,
    order.shippingState,
    order.shippingCountry,
    order.shippingPostalCode,
  ].filter(Boolean);

  return <div className="d-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="d-order-detail-modal" role="dialog" aria-modal="true" aria-label="Order details">
      <header className="d-detail-header">
        <div><small>ORDER DETAILS</small><h2>#{order.orderNumber || order.id}</h2><p>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date not available"}</p></div>
        <button className="d-detail-close" onClick={onClose} aria-label="Close details">×</button>
      </header>
      <div className="d-detail-content">
        <div className="d-detail-status"><strong>Status: {label(status)}</strong>
          {status !== "CANCELLED" && <div className="d-status-timeline">{steps.map((step, i) => <div className={`d-timeline-step ${current >= i ? "active" : ""}`} key={step}><span className="d-timeline-dot"/><small>{label(step)}</small></div>)}</div>}
        </div>
        <section className="d-detail-section"><h3>Products</h3>
          {(order.items || []).map((item, i) => <div className="d-detail-product" key={item.id || i}>
            <div><strong>{item.productName || item.name || `Product ${item.productId || ""}`}</strong><small>Qty: {item.quantity ?? 1} × {money(item.unitPrice ?? item.price)}</small></div>
            <strong>{money(item.subtotal ?? Number(item.unitPrice ?? item.price) * Number(item.quantity ?? 1))}</strong>
          </div>)}
        </section>
        <section className="d-detail-section"><h3>Price Summary</h3>
          <div className="d-detail-row"><span>Subtotal</span><span>{money(order.subtotalAmount ?? order.totalAmount)}</span></div>
          <div className="d-detail-row"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>- {money(order.discountAmount)}</span></div>
          <div className="d-detail-row total"><strong>Order Total</strong><strong>{money(order.totalAmount)}</strong></div>
        </section>
        <section className="d-detail-section"><h3>Delivery Address</h3>
          {address.length ? <address>{address.map((line, i) => <span key={i}>{line}</span>)}</address> : <p>Address details are not available in this order record.</p>}
        </section>
        <section className="d-detail-section"><h3>Payment</h3>
          <div className="d-detail-row"><span>Payment Method</span><span>{order.paymentMethod || "Cash on Delivery"}</span></div>
          <div className="d-detail-row"><span>Payment Status</span><span>{order.paymentStatus || (String(order.paymentMethod || "").toUpperCase().includes("COD") ? "Pending" : "Not available")}</span></div>
        </section>
        {returnRequests.length > 0 && <section className="d-detail-section">
          <h3>Return & Refund Updates</h3>
          {returnRequests.map((request) => <div key={request.id} style={{ border: "1px solid #eadfd4", padding: "12px", marginBottom: "10px", background: "#fbf7f2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <strong>{request.returnNumber || `Return #${request.id}`}</strong>
              <strong>{label(request.status)}</strong>
            </div>
            <p style={{ margin: "8px 0 4px" }}><strong>Product:</strong> {request.productName || (order.items || []).find((item) => String(item.id) === String(request.orderItemId))?.productName || "Product"}</p>
            <p style={{ margin: "4px 0" }}><strong>Return quantity:</strong> {request.returnQuantity ?? request.quantity}</p>
            <p style={{ margin: "4px 0" }}><strong>Reason:</strong> {request.reason}</p>
            {request.additionalDetails && <p style={{ margin: "4px 0" }}><strong>Details:</strong> {request.additionalDetails}</p>}
            <p style={{ margin: "4px 0" }}><strong>Refund amount:</strong> {money(request.refundAmount)}</p>
            {request.refundMethod && <p style={{ margin: "4px 0" }}><strong>Refund method:</strong> {label(request.refundMethod)}</p>}
            {request.refundTransactionId && <p style={{ margin: "4px 0" }}><strong>Refund transaction:</strong> {request.refundTransactionId}</p>}
            {request.adminNote && <p style={{ margin: "4px 0" }}><strong>Dianora update:</strong> {request.adminNote}</p>}
            <p style={{ margin: "4px 0", color: "#82654a", fontSize: "12px" }}>Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleString("en-IN") : "Date unavailable"}</p>
          </div>)}
        </section>}
        {canReturn && canRequestMore && <button className="d-return-button" onClick={() => onReturn(order)}>Request Return</button>}
        {canReturn && !canRequestMore && returnRequests.length > 0 && <p className="d-return-note">Return request already submitted for all purchased quantities. Track the status above.</p>}
        {status === "CANCELLED" && <p className="d-return-note">This order was cancelled. Return is not available.</p>}
      </div>
    </section>
  </div>;
}

function ReturnRequest({ order, returnRequests = [], onClose, onSubmit }) {
  const activeReturnStatuses = ["REQUESTED", "APPROVED", "PICKUP_SCHEDULED", "RECEIVED", "REFUND_PROCESSING", "REFUNDED"];
  const requestedByItem = returnRequests.reduce((map, request) => {
    if (activeReturnStatuses.includes(String(request.status || "").toUpperCase())) {
      const key = String(request.orderItemId);
      map[key] = (map[key] || 0) + Number(request.returnQuantity || request.quantity || 0);
    }
    return map;
  }, {});
  const items = (order.items || []).map((item) => ({
    ...item,
    returnableQuantity: Math.max(0, Number(item.quantity || 0) - (requestedByItem[String(item.id)] || 0))
  })).filter((item) => item.returnableQuantity > 0);
  const [itemId, setItemId] = useState(String(items[0]?.id ?? ""));
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const selectedItem = items.find((x) => String(x.id) === itemId);
    if (!itemId || !reason) { setError("Select a product and return reason."); return; }
    if (!selectedItem || Number(quantity) < 1 || Number(quantity) > selectedItem.returnableQuantity) {
      setError("Return quantity exceeds the remaining returnable quantity.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ orderId: order.id, orderItemId: Number(itemId), quantity: Number(quantity), reason, description });
      onClose();
    } catch (err) { setError(err.message || "Return request could not be submitted."); }
    finally { setBusy(false); }
  }

  return <div className="d-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="d-order-detail-modal d-return-modal" role="dialog" aria-modal="true" aria-label="Return request">
      <header className="d-detail-header"><div><small>RETURN REQUEST</small><h2>Order #{order.orderNumber || order.id}</h2></div><button className="d-detail-close" onClick={onClose}>×</button></header>
      <form className="d-detail-content" onSubmit={submit}>
        <label>Product<select value={itemId} onChange={(e) => { setItemId(e.target.value); setQuantity(1); }} required>{items.map((item) => <option key={item.id} value={item.id}>{item.productName || item.name} (returnable {item.returnableQuantity} of {item.quantity})</option>)}</select></label>
        <label>Return Quantity<input type="number" min="1" max={items.find((x) => String(x.id) === itemId)?.returnableQuantity || 1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></label>
        <label>Reason<select value={reason} onChange={(e) => setReason(e.target.value)} required><option value="">Choose a reason</option><option>Damaged product</option><option>Wrong product received</option></select></label>
        <label>Additional details<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" maxLength="1000" placeholder="Tell us more (optional)" /></label>
        {error && <div className="d-account-alert error">{error}</div>}
        <p className="d-return-note">Your request will be reviewed by Dianora. Refund is not issued until the return is approved and processed.</p>
        <button className="d-return-button" disabled={busy}>{busy ? "Submitting..." : "Submit Return Request"}</button>
      </form>
    </section>
  </div>;
}

export default function MyOrders() {
  const user = getLoggedInUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [notice, setNotice] = useState("");
  const [returnsByOrder, setReturnsByOrder] = useState({});

  async function refreshReturns(orderId) {
    if (!user?.id || !orderId) return [];
    const data = await apiRequest(`/returns/order/${orderId}/user/${user.id}`);
    const rows = Array.isArray(data) ? data : data?.content || data?.data || [];
    setReturnsByOrder((previous) => ({ ...previous, [String(orderId)]: rows }));
    return rows;
  }

  useEffect(() => {
    if (!user?.id) { setLoading(false); setError("Please login again to view orders."); return; }
    apiRequest(`/orders/user/${user.id}`)
      .then(async (data) => {
        const loadedOrders = Array.isArray(data) ? data : data?.content || data?.data || [];
        setOrders(loadedOrders);
        await Promise.all(loadedOrders.map((order) => refreshReturns(order.id).catch(() => {
          setReturnsByOrder((previous) => ({ ...previous, [String(order.id)]: [] }));
        })));
      })
      .catch((err) => setError(err.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  async function submitReturn(payload) {
    if (!user?.id) {
      throw new Error("Your customer account ID is missing. Please log out and log in again.");
    }

    const returnPayload = {
      userId: Number(user.id),
      orderId: Number(payload.orderId),
      orderItemId: Number(payload.orderItemId),
      quantity: Number(payload.quantity),
      reason: payload.reason,
      additionalDetails: payload.description || ""
    };

    await apiRequest("/returns", {
      method: "POST",
      body: JSON.stringify(returnPayload)
    });

    await refreshReturns(payload.orderId);
    setNotice("Return request submitted. Return status and reason are now available in Order Details.");
  }

  return <AccountLayout title="My Orders" subtitle="Your order history and status">
    <h2 className="d-panel-title">Order History</h2><p className="d-panel-subtitle">Select an order to view all details, delivery address and available actions.</p>
    {notice && <div className="d-account-alert success">{notice}</div>}
    {loading ? <div className="d-loading">Loading your orders...</div> : error ? <div className="d-account-alert error">{error}</div> : orders.length === 0 ? <div className="d-loading">You haven't placed any orders yet.</div> : orders.map((order) => (
      <article className="d-order-card d-order-clickable" key={order.id ?? order.orderNumber} onClick={() => setSelected(order)} tabIndex="0" role="button" onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(order)}>
        <div className="d-order-head"><div><strong>Order #{order.orderNumber ?? order.id}</strong><div className="d-order-date">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date not available"}</div></div><span className="d-order-status">{label(order.status)}</span></div>
        <div className="d-order-body">
          {(order.items || []).map((item, index) => <div className="d-order-line" key={item.id ?? index}><span>{item.productName || item.name || `Product ${item.productId || ""}`} × {item.quantity || 1}</span><strong>{money(item.subtotal ?? Number(item.unitPrice ?? item.price) * Number(item.quantity || 1))}</strong></div>)}
          <div className="d-order-line d-order-total"><strong>Total</strong><strong>{money(order.totalAmount ?? order.total ?? order.subtotalAmount)}</strong></div>
          {(returnsByOrder[String(order.id)] || []).length > 0 && <div style={{ marginTop: "10px", padding: "10px", background: "#fbf7f2", border: "1px solid #eadfd4" }}>
            <strong style={{ display: "block", marginBottom: "6px" }}>Return / Refund</strong>
            {(returnsByOrder[String(order.id)] || []).map((request) => <div key={request.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", fontSize: "13px", margin: "4px 0" }}>
              <span>{request.reason} · Qty {request.returnQuantity ?? request.quantity}</span><strong>{label(request.status)}</strong>
            </div>)}
            <span style={{ fontSize: "12px" }}>Open View full details for refund amount and updates.</span>
          </div>}
          <div className="d-order-footer"><span>Payment: {order.paymentMethod || "Cash on Delivery"}</span><span>View full details →</span></div>
        </div>
      </article>
    ))}
    {selected && <OrderDetails order={selected} userId={user?.id} returnRequests={returnsByOrder[String(selected.id)] || []} onClose={() => setSelected(null)} onReturn={(order) => { setSelected(null); setReturnOrder(order); }} />}
    {returnOrder && <ReturnRequest order={returnOrder} returnRequests={returnsByOrder[String(returnOrder.id)] || []} onClose={() => setReturnOrder(null)} onSubmit={submitReturn} />}
  </AccountLayout>;
}
