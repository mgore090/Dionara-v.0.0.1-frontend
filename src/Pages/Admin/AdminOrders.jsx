import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PICKUP_SCHEDULED",
  "RECEIVED",
  "REFUND_PROCESSING",
  "REFUNDED",
];

const RETURN_TRANSITIONS = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["PICKUP_SCHEDULED", "RECEIVED"],
  PICKUP_SCHEDULED: ["RECEIVED"],
  RECEIVED: ["REFUND_PROCESSING"],
  REFUND_PROCESSING: ["REFUNDED"],
  REJECTED: [],
  REFUNDED: [],
};

const REFUND_METHODS = [
  "ORIGINAL_PAYMENT_METHOD",
  "UPI",
  "BANK_TRANSFER",
];

function prettyStatus(value) {
  return String(value || "—").replaceAll("_", " ");
}


function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function getStatus(order) {
  return String(order.status ?? "PLACED").toUpperCase();
}

function getCustomerName(order) {
  return (
    order.shippingFullName ??
    order.customerName ??
    order.fullName ??
    order.customer?.name ??
    order.shippingAddress?.fullName ??
    "Customer"
  );
}

function getItems(order) {
  return Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.orderItems)
      ? order.orderItems
      : [];
}

function getOrderTotal(order) {
  return Number(
    order.totalAmount ??
    order.total ??
    order.grandTotal ??
    order.amount ??
    0
  );
}

function getOrderId(order) {
  // Use the numeric database ID for API calls.
  return order.id ?? order.orderId;
}

function getOrderLabel(order) {
  return order.orderNumber ?? getOrderId(order) ?? "—";
}

function getCustomerPhone(order) {
  return (
    order.shippingPhone ??
    order.phone ??
    order.mobile ??
    order.customerPhone ??
    order.customer?.phone ??
    "No phone"
  );
}

function getShippingAddress(order) {
  if (typeof order.shippingAddress === "string") return order.shippingAddress;

  const parts = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingCity,
    order.shippingState,
    order.shippingCountry,
    order.shippingPostalCode,
    order.shippingAddress?.addressLine1,
    order.shippingAddress?.addressLine2,
    order.shippingAddress?.address,
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.pinCode ?? order.shippingAddress?.postalCode,
  ].filter(Boolean);

  return [...new Set(parts)].join(", ") || order.address || "Address not provided by API";
}

function getStatusClass(status) {
  return `admin-orders-status admin-orders-status-${status.toLowerCase()}`;
}

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [returnRequests, setReturnRequests] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnNextStatus, setReturnNextStatus] = useState("");
  const [returnAdminNote, setReturnAdminNote] = useState("");
  const [refundMethod, setRefundMethod] = useState("UPI");
  const [refundDestination, setRefundDestination] = useState("");
  const [refundTransactionId, setRefundTransactionId] = useState("");
  const [returnUpdatingId, setReturnUpdatingId] = useState(null);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/orders`);

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Could not load orders (${response.status})`
        );
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : null;

      if (!list) {
        throw new Error("The orders API did not return an order list.");
      }

      setOrders(list);
    } catch (err) {
      setError(
        `${err.message}. Check whether the Order API exists, Spring Boot is running, and CORS is configured.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReturns = useCallback(async () => {
    setReturnsLoading(true);
    setReturnError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/returns`);
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Could not load return requests (${response.status})`);
      }
      const data = await response.json();
      setReturnRequests(Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : []);
    } catch (err) {
      setReturnError(`${err.message}. Verify that AdminReturnController GET /api/admin/returns is available.`);
    } finally {
      setReturnsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadReturns();
  }, [loadOrders, loadReturns]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = String(getOrderId(order) ?? "").toLowerCase();
      const orderNumber = String(order.orderNumber ?? "").toLowerCase();
      const customer = getCustomerName(order).toLowerCase();
      const phone = getCustomerPhone(order).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        orderNumber.includes(query) ||
        customer.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || getStatus(order) === statusFilter;

      const rawDate =
        order.createdAt ?? order.orderDate ?? order.createdDate;
      const orderDay = rawDate
        ? String(rawDate).slice(0, 10)
        : "";

      const matchesDate = !dateFilter || orderDay === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const summary = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((order) => getStatus(order) === "PLACED").length,
      processing: orders.filter((order) =>
        ["CONFIRMED", "PROCESSING"].includes(getStatus(order))
      ).length,
      shipped: orders.filter((order) => getStatus(order) === "SHIPPED").length,
      delivered: orders.filter((order) => getStatus(order) === "DELIVERED").length,
      cancelled: orders.filter((order) => getStatus(order) === "CANCELLED").length,
    };
  }, [orders]);

  async function updateOrderStatus(order, nextStatus) {
    const id = getOrderId(order);

    if (id == null) {
      setError("This order does not have an ID.");
      return;
    }

    const currentStatus = getStatus(order);
    if (currentStatus === nextStatus) return;

    const confirmed = window.confirm(
      `Change order #${id} from ${currentStatus} to ${nextStatus}?`
    );

    if (!confirmed) return;

    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Status update failed (${response.status})`
        );
      }

      const contentType = response.headers.get("content-type") || "";
      const updatedOrder = contentType.includes("application/json")
        ? await response.json()
        : null;

      setOrders((current) =>
        current.map((item) =>
          String(getOrderId(item)) === String(id)
            ? updatedOrder && getOrderId(updatedOrder) != null
              ? updatedOrder
              : { ...item, status: nextStatus }
            : item
        )
      );

      if (
        selectedOrder &&
        String(getOrderId(selectedOrder)) === String(id)
      ) {
        setSelectedOrder(
          updatedOrder && getOrderId(updatedOrder) != null
            ? updatedOrder
            : { ...selectedOrder, status: nextStatus }
        );
      }

      setSuccess(`Order #${id} updated to ${nextStatus}.`);
      await loadOrders();
    } catch (err) {
      setError(`Could not update order status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateReturnStatus() {
    if (!selectedReturn || !returnNextStatus) {
      setReturnError("Select a return status to update.");
      return;
    }

    if (["REFUND_PROCESSING", "REFUNDED"].includes(returnNextStatus) && !refundMethod) {
      setReturnError("Refund method is required.");
      return;
    }
    if (returnNextStatus === "REFUNDED" && !refundTransactionId.trim()) {
      setReturnError("Refund transaction ID is required to mark the refund completed.");
      return;
    }

    const id = selectedReturn.id;
    setReturnUpdatingId(id);
    setReturnError("");
    setReturnSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: returnNextStatus,
          refundMethod: ["REFUND_PROCESSING", "REFUNDED"].includes(returnNextStatus) ? refundMethod : null,
          refundDestination: refundDestination.trim() || null,
          refundTransactionId: returnNextStatus === "REFUNDED" ? refundTransactionId.trim() : null,
          adminNote: returnAdminNote.trim() || null,
        }),
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Return update failed (${response.status})`);
      }
      const updated = await response.json();
      setReturnRequests((previous) => previous.map((item) => String(item.id) === String(id) ? updated : item));
      setSelectedReturn(updated);
      setReturnSuccess(`Return ${updated.returnNumber || `#${id}`} updated to ${prettyStatus(updated.status)}.`);
      setReturnNextStatus("");
      await loadReturns();
    } catch (err) {
      setReturnError(err.message || "Could not update return request.");
    } finally {
      setReturnUpdatingId(null);
    }
  }

  function openReturnDetails(request) {
    setSelectedReturn(request);
    setReturnNextStatus("");
    setReturnAdminNote(request.adminNote || "");
    setRefundMethod(request.refundMethod || "UPI");
    setRefundDestination(request.refundDestination || "");
    setRefundTransactionId(request.refundTransactionId || "");
    setReturnError("");
    setReturnSuccess("");
  }

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
        <span>/</span>
        <span>Orders</span>
      </div>

      <header className="admin-orders-header">
        <div>
          <p className="admin-orders-eyebrow">ORDER MANAGEMENT</p>
          <h1>Orders</h1>
          <p className="admin-orders-subtitle">
            View customer orders, track fulfilment and update order status.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Orders"}
        </button>
      </header>

      {error && (
        <div className="admin-orders-alert admin-orders-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-orders-alert admin-orders-alert-success">
          {success}
        </div>
      )}

      <nav className="admin-orders-tabs" aria-label="Order management tabs" style={{ display: "flex", gap: 12, margin: "24px 0", borderBottom: "1px solid #e8ddd2", paddingBottom: 12 }}>
        <button type="button" onClick={() => setActiveTab("orders")} aria-pressed={activeTab === "orders"} style={{ padding: "12px 22px", border: "1px solid #d9c8b8", background: activeTab === "orders" ? "#8b6b4d" : "#fff", color: activeTab === "orders" ? "#fff" : "#2c241e", cursor: "pointer", fontWeight: 600 }}>
          Orders ({orders.length})
        </button>
        <button type="button" onClick={() => setActiveTab("returns")} aria-pressed={activeTab === "returns"} style={{ padding: "12px 22px", border: "1px solid #d9c8b8", background: activeTab === "returns" ? "#8b6b4d" : "#fff", color: activeTab === "returns" ? "#fff" : "#2c241e", cursor: "pointer", fontWeight: 600 }}>
          Return Requests ({returnRequests.filter((item) => ["REQUESTED", "RECEIVED", "PENDING"].includes(String(item.status || "").toUpperCase())).length})
        </button>
      </nav>

      {activeTab === "orders" && (
      <section className="admin-orders-summary">
        <button
          type="button"
          className={`admin-orders-stat ${statusFilter === "ALL" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("ALL")}
        >
          <span>Total Orders</span>
          <strong>{summary.all}</strong>
        </button>

        <button
          type="button"
          className={`admin-orders-stat ${statusFilter === "PLACED" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("PLACED")}
        >
          <span>Placed</span>
          <strong>{summary.pending}</strong>
        </button>

        <button
          type="button"
          className={`admin-orders-stat ${["CONFIRMED", "PROCESSING"].includes(statusFilter) ? "is-active" : ""}`}
          onClick={() => setStatusFilter("PROCESSING")}
        >
          <span>Processing</span>
          <strong>{summary.processing}</strong>
        </button>

        <button
          type="button"
          className={`admin-orders-stat ${statusFilter === "SHIPPED" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("SHIPPED")}
        >
          <span>Shipped</span>
          <strong>{summary.shipped}</strong>
        </button>

        <button
          type="button"
          className={`admin-orders-stat ${statusFilter === "DELIVERED" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("DELIVERED")}
        >
          <span>Delivered</span>
          <strong>{summary.delivered}</strong>
        </button>

        <button
          type="button"
          className={`admin-orders-stat ${statusFilter === "CANCELLED" ? "is-active" : ""}`}
          onClick={() => setStatusFilter("CANCELLED")}
        >
          <span>Cancelled</span>
          <strong>{summary.cancelled}</strong>
        </button>
      </section>

      )}

      {activeTab === "returns" && (
      <section className="admin-orders-table-card" style={{ marginBottom: "24px" }}>
        <div className="admin-orders-table-heading">
          <div>
            <p className="admin-orders-eyebrow">CUSTOMER RETURNS</p>
            <h2>Return Requests</h2>
            <p className="admin-orders-subtitle">Review return reasons, approve or reject requests, and track refund processing.</p>
          </div>
          <button type="button" className="admin-orders-refresh" onClick={loadReturns} disabled={returnsLoading}>
            {returnsLoading ? "Loading..." : "↻ Refresh Returns"}
          </button>
        </div>
        {returnError && <div className="admin-orders-alert admin-orders-alert-error">{returnError}</div>}
        {returnSuccess && <div className="admin-orders-alert admin-orders-alert-success">{returnSuccess}</div>}
        {returnsLoading ? (
          <div className="admin-orders-empty">Loading return requests...</div>
        ) : returnRequests.length === 0 ? (
          <div className="admin-orders-empty">
            <h3>No return requests</h3>
            <p>Customer return requests will appear here after submission.</p>
          </div>
        ) : (
          <div className="admin-orders-table-scroll">
            <table className="admin-orders-table">
              <thead><tr>
                <th>Return</th><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Reason</th><th>Refund</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {returnRequests.map((request) => {
                  const order = orders.find((item) => String(getOrderId(item)) === String(request.orderId));
                  return <tr key={request.id}>
                    <td>
                      <button type="button" className="admin-orders-link-button" style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", color: "inherit", textAlign: "left" }} onClick={() => openReturnDetails(request)}>
                        <strong>{request.returnNumber || `RET-${request.id}`}</strong>
                      </button>
                      <small>{formatDate(request.createdAt)}</small>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-orders-link-button"
                        onClick={() => {
                          if (order) {
                            setSelectedOrder(order);
                          } else {
                            openReturnDetails(request);
                          }
                        }}
                        title={order ? "Open full order details" : "Open return details"}
                      >
                        <strong>#{request.orderNumber || (order ? getOrderLabel(order) : request.orderId)}</strong>
                      </button>
                    </td>
                    <td><strong>{order ? getCustomerName(order) : `User #${request.userId || "—"}`}</strong><small>{order ? getCustomerPhone(order) : ""}</small></td>
                    <td>{request.productName || `Order item #${request.orderItemId}`}</td>
                    <td>{request.returnQuantity ?? request.quantity ?? "—"}</td>
                    <td>{request.reason || "—"}{request.additionalDetails && <small>{request.additionalDetails}</small>}</td>
                    <td>{formatCurrency(request.refundAmount)}{request.refundMethod && <small>{prettyStatus(request.refundMethod)}</small>}</td>
                    <td><span className={getStatusClass(String(request.status || "REQUESTED").toUpperCase())}>{prettyStatus(request.status)}</span></td>
                    <td><button type="button" className="admin-orders-view-button" onClick={() => openReturnDetails(request)}>Review</button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      )}

      {activeTab === "orders" && (
      <section className="admin-orders-table-card">
        <div className="admin-orders-table-heading">
          <div>
            <p className="admin-orders-eyebrow">CUSTOMER PURCHASES</p>
            <h2>All Orders</h2>
          </div>

          <div className="admin-orders-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer or phone"
              aria-label="Search orders"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by order status"
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter by order date"
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-orders-empty">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <div className="admin-orders-empty-icon">▤</div>
            <h3>No orders found</h3>
            <p>
              {orders.length === 0
                ? "The backend returned no orders. New customer orders will appear here once the checkout flow saves them through the Order API."
                : "Try changing the search or filters."}
            </p>
          </div>
        ) : (
          <div className="admin-orders-table-scroll">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const id = getOrderId(order);
                  const status = getStatus(order);
                  const items = getItems(order);
                  const rawDate =
                    order.createdAt ?? order.orderDate ?? order.createdDate;

                  return (
                    <tr key={id}>
                      <td>
                        <button
                          type="button"
                          className="admin-orders-view-button"
                          style={{ fontWeight: 700, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                          onClick={() => setSelectedOrder(order)}
                          title="Open complete order details"
                        >
                          #{getOrderLabel(order)}
                        </button>
                      </td>

                      <td>
                        <strong>{getCustomerName(order)}</strong>
                        <small>
                          {getCustomerPhone(order)}
                        </small>
                      </td>

                      <td>{formatDate(rawDate)}</td>

                      <td>
                        {items.reduce(
                          (sum, item) => sum + Number(item.quantity ?? 1),
                          0
                        )}
                      </td>

                      <td className="admin-orders-total">
                        {formatCurrency(getOrderTotal(order))}
                      </td>

                      <td>
                        {order.paymentMethod ?? order.paymentType ?? "—"}
                      </td>

                      <td>
                        <span className={getStatusClass(status)}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-orders-row-actions">
                          <button
                            type="button"
                            className="admin-orders-view-button"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Details
                          </button>

                          <select
                            aria-label={`Update status for order ${id}`}
                            value={status}
                            disabled={
                              updatingId === id ||
                              status === "DELIVERED" ||
                              status === "CANCELLED"
                            }
                            onChange={(event) =>
                              updateOrderStatus(order, event.target.value)
                            }
                          >
                            {!STATUSES.includes(status) && (
                              <option value={status}>{status}</option>
                            )}
                            {STATUSES.map((option) => (
                              <option value={option} key={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      )}

      <footer className="admin-orders-footer">
        <span>DIANORA</span>
        <span>Order management</span>
      </footer>

      {selectedReturn && (
        <div className="admin-orders-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedReturn(null);
        }}>
          <section className="admin-orders-modal" role="dialog" aria-modal="true" aria-labelledby="admin-return-details-title">
            <div className="admin-orders-modal-header">
              <div>
                <p className="admin-orders-eyebrow">RETURN & REFUND REVIEW</p>
                <h2 id="admin-return-details-title">{selectedReturn.returnNumber || `Return #${selectedReturn.id}`}</h2>
              </div>
              <button type="button" className="admin-orders-modal-close" onClick={() => setSelectedReturn(null)} aria-label="Close return details">×</button>
            </div>
            <div className="admin-orders-detail-grid">
              <div><span>Order</span><strong>#{selectedReturn.orderNumber || selectedReturn.orderId}</strong></div>
              <div><span>Product</span><strong>{selectedReturn.productName || selectedReturn.product?.name || selectedReturn.orderItem?.product?.name || `Order item #${selectedReturn.orderItemId}`}</strong></div>
              <div><span>Ordered Qty</span><strong>{selectedReturn.orderedQuantity ?? selectedReturn.orderItem?.quantity ?? "—"}</strong></div>
              <div><span>Return Qty</span><strong>{selectedReturn.returnQuantity ?? selectedReturn.quantity ?? selectedReturn.requestedQuantity ?? "—"}</strong></div>
              <div><span>Reason</span><strong>{selectedReturn.reason || "—"}</strong></div>
              <div><span>Submitted</span><strong>{formatDate(selectedReturn.createdAt)}</strong></div>
              <div><span>Current Status</span><strong>{prettyStatus(selectedReturn.status)}</strong></div>
              <div><span>Refund Amount</span><strong>{formatCurrency(selectedReturn.refundAmount ?? selectedReturn.refund_amount ?? selectedReturn.quantity * (selectedReturn.orderItem?.price ?? 0))}</strong></div>
              <div><span>Refund Method</span><strong>{prettyStatus(selectedReturn.refundMethod)}</strong></div>
              <div><span>Refund Destination</span><strong>{selectedReturn.refundDestination || "—"}</strong></div>
              <div><span>Refund Transaction ID</span><strong>{selectedReturn.refundTransactionId || "—"}</strong></div>
              <div><span>Last Updated</span><strong>{formatDate(selectedReturn.updatedAt)}</strong></div>
            </div>
            <div className="admin-orders-address">
              <h3>Customer Details & Shipping Address</h3>
              {(() => {
                const relatedOrder = orders.find((item) => String(getOrderId(item)) === String(selectedReturn.orderId));
                return relatedOrder ? <>
                  <p><strong>{getCustomerName(relatedOrder)}</strong></p>
                  <p>{getCustomerPhone(relatedOrder)}</p>
                  <p>{relatedOrder.email ?? relatedOrder.customer?.email ?? "Email not provided"}</p>
                  <p>{getShippingAddress(relatedOrder)}</p>
                </> : <p>Order/customer address detail is not included in the current orders API response.</p>;
              })()}
            </div>
            <div className="admin-orders-items">
              <h3>Customer's Return Reason & Description</h3>
              <p><strong>{selectedReturn.reason || "—"}</strong></p>
              <p>{selectedReturn.additionalDetails || "No additional details provided."}</p>
              {selectedReturn.adminNote && <p><strong>Admin note:</strong> {selectedReturn.adminNote}</p>}
            </div>
            {["REJECTED", "REFUNDED"].includes(String(selectedReturn.status).toUpperCase()) ? (
              <div className="admin-orders-alert">This return request is in a final status: {prettyStatus(selectedReturn.status)}.</div>
            ) : (
              <div className="admin-orders-modal-actions" style={{ display: "block" }}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                  Update Return Status
                  <select value={returnNextStatus} onChange={(event) => setReturnNextStatus(event.target.value)} style={{ display: "block", width: "100%", marginTop: "6px" }}>
                    <option value="">Select next status</option>
                    {(RETURN_TRANSITIONS[String(selectedReturn.status || "REQUESTED").toUpperCase()] || []).map((status) => <option value={status} key={status}>{prettyStatus(status)}</option>)}
                  </select>
                </label>
                {["REFUND_PROCESSING", "REFUNDED"].includes(returnNextStatus) && <>
                  <label style={{ display: "block", marginBottom: "12px" }}>
                    Refund Method
                    <select value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)} style={{ display: "block", width: "100%", marginTop: "6px" }}>
                      {REFUND_METHODS.map((method) => <option key={method} value={method}>{prettyStatus(method)}</option>)}
                    </select>
                  </label>
                  <label style={{ display: "block", marginBottom: "12px" }}>
                    Refund Destination (UPI ID / bank details reference)
                    <input value={refundDestination} onChange={(event) => setRefundDestination(event.target.value)} placeholder="Enter refund destination" style={{ display: "block", width: "100%", marginTop: "6px" }} />
                  </label>
                </>}
                {returnNextStatus === "REFUNDED" && <label style={{ display: "block", marginBottom: "12px" }}>
                  Refund Transaction ID (required)
                  <input value={refundTransactionId} onChange={(event) => setRefundTransactionId(event.target.value)} placeholder="Enter transaction reference" style={{ display: "block", width: "100%", marginTop: "6px" }} />
                </label>}
                <label style={{ display: "block", marginBottom: "12px" }}>
                  Admin Note
                  <textarea value={returnAdminNote} onChange={(event) => setReturnAdminNote(event.target.value)} rows={3} placeholder="Write customer-facing status update / internal note" style={{ display: "block", width: "100%", marginTop: "6px" }} />
                </label>
                {returnError && <div className="admin-orders-alert admin-orders-alert-error">{returnError}</div>}
                <button type="button" className="admin-orders-refresh" onClick={updateReturnStatus} disabled={returnUpdatingId === selectedReturn.id || !returnNextStatus}>
                  {returnUpdatingId === selectedReturn.id ? "Updating..." : "Apply Return Update"}
                </button>
              </div>
            )}
            <button type="button" className="admin-orders-refresh" onClick={() => setSelectedReturn(null)} style={{ marginTop: "12px" }}>Close</button>
          </section>
        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-orders-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="admin-orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-details-title"
          >
            <div className="admin-orders-modal-header">
              <div>
                <p className="admin-orders-eyebrow">ORDER DETAILS</p>
                <h2 id="admin-order-details-title">
                  Order #{getOrderLabel(selectedOrder)}
                </h2>
              </div>
              <button
                type="button"
                className="admin-orders-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="admin-orders-detail-grid">
              <div>
                <span>Customer</span>
                <strong>{getCustomerName(selectedOrder)}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>
                  {getCustomerPhone(selectedOrder) === "No phone" ? "—" : getCustomerPhone(selectedOrder)}
                </strong>
              </div>
              <div>
                <span>Email</span>
                <strong>
                  {selectedOrder.email ??
                    selectedOrder.customer?.email ??
                    "—"}
                </strong>
              </div>
              <div>
                <span>Order Date</span>
                <strong>
                  {formatDate(
                    selectedOrder.createdAt ??
                    selectedOrder.orderDate ??
                    selectedOrder.createdDate
                  )}
                </strong>
              </div>
              <div>
                <span>Payment</span>
                <strong>
                  {selectedOrder.paymentMethod ??
                    selectedOrder.paymentType ??
                    "—"}
                </strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatCurrency(getOrderTotal(selectedOrder))}</strong>
              </div>
            </div>

            <div className="admin-orders-address">
              <h3>Shipping Address</h3>
              <p>
                {getShippingAddress(selectedOrder)}
              </p>
            </div>

            <div className="admin-orders-items">
              <h3>Ordered Products</h3>
              {getItems(selectedOrder).length === 0 ? (
                <p>Order items were not included in this API response.</p>
              ) : (
                getItems(selectedOrder).map((item, index) => (
                  <div
                    className="admin-orders-item"
                    key={item.id ?? item.productId ?? index}
                  >
                    <div>
                      <strong>
                        {item.productName ??
                          item.name ??
                          item.product?.name ??
                          `Product ${item.productId ?? ""}`}
                      </strong>
                      <span>Qty: {item.quantity ?? 1}</span>
                    </div>
                    <strong>
                      {formatCurrency(
                        item.subtotal ??
                        Number(item.price ?? item.unitPrice ?? 0) *
                          Number(item.quantity ?? 1)
                      )}
                    </strong>
                  </div>
                ))
              )}
            </div>

            {(() => {
              const orderId = getOrderId(selectedOrder);
              const relatedReturns = returnRequests.filter((request) =>
                String(request.orderId ?? request.order?.id) === String(orderId)
              );
              return (
                <div className="admin-orders-items" style={{ marginTop: "18px" }}>
                  <h3>Return / Refund Information</h3>
                  {relatedReturns.length === 0 ? (
                    <p>This order has no return request.</p>
                  ) : (
                    relatedReturns.map((request) => (
                      <div className="admin-orders-item" key={request.id}>
                        <div>
                          <strong>{request.returnNumber || `Return #${request.id}`}</strong>
                          <span>Product: {request.productName || request.orderItem?.product?.name || `Order item #${request.orderItemId ?? "—"}`}</span>
                          <span>Return Qty: {request.returnQuantity ?? request.quantity ?? "—"}</span>
                          <span>Reason: {request.reason || "—"}</span>
                          <span>Status: {prettyStatus(request.status)}</span>
                          <span>Refund: {formatCurrency(request.refundAmount)}</span>
                          {request.refundMethod && <span>Refund Method: {prettyStatus(request.refundMethod)}</span>}
                          {request.refundDestination && <span>Refund Destination: {request.refundDestination}</span>}
                          {request.refundTransactionId && <span>Transaction ID: {request.refundTransactionId}</span>}
                          {request.additionalDetails && <span>Details: {request.additionalDetails}</span>}
                        </div>
                        <button type="button" className="admin-orders-view-button" onClick={() => openReturnDetails(request)}>
                          View Return Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}

            <div className="admin-orders-modal-actions">
              <label>
                Update Order Status
                <select
                  value={getStatus(selectedOrder)}
                  disabled={
                    updatingId === getOrderId(selectedOrder) ||
                    ["DELIVERED", "CANCELLED"].includes(
                      getStatus(selectedOrder)
                    )
                  }
                  onChange={(event) =>
                    updateOrderStatus(selectedOrder, event.target.value)
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="admin-orders-refresh"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
