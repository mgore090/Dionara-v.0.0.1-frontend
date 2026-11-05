
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCustomers.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function money(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function dateText(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function customerId(customer) {
  return customer.id ?? customer.customerId;
}

function customerName(customer) {
  return (
    customer.fullName ??
    customer.name ??
    customer.customerName ??
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ??
    "Customer"
  );
}

function customerOrders(customer) {
  return Array.isArray(customer.orders) ? customer.orders : [];
}

function customerReviews(customer) {
  return Array.isArray(customer.reviews) ? customer.reviews : [];
}

function orderAmount(order) {
  return Number(
    order.totalAmount ??
      order.grandTotal ??
      order.total ??
      order.amount ??
      0
  );
}

function orderItems(order) {
  return Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.orderItems)
      ? order.orderItems
      : [];
}

function reviewRating(review) {
  return Number(review.rating ?? review.stars ?? 0);
}

function customerStatus(customer) {
  return String(customer.status ?? (customer.active === false ? "INACTIVE" : "ACTIVE"))
    .toUpperCase();
}

function statusClass(status) {
  return `admin-customers-status admin-customers-status-${status.toLowerCase()}`;
}

function getAddress(customer) {
  const address = customer.address ?? customer.shippingAddress;

  if (typeof address === "string") return address;
  if (!address || typeof address !== "object") return "";

  return [
    address.fullName,
    address.addressLine1,
    address.addressLine2,
    address.address,
    address.city,
    address.state,
    address.pinCode ?? address.postalCode ?? address.zipCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/customers`);

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Could not load customers (${response.status})`
        );
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : null;

      if (!list) {
        throw new Error("The Customers API did not return a customer list.");
      }

      setCustomers(list);
    } catch (err) {
      setError(
        `${err.message}. Check the Customer API, Spring Boot server and CORS configuration.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        [
          customerId(customer),
          customerName(customer),
          customer.email,
          customer.phone,
          customer.mobile,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        customerStatus(customer) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const summary = useMemo(() => {
    const active = customers.filter(
      (customer) => customerStatus(customer) === "ACTIVE"
    ).length;

    const totalOrders = customers.reduce(
      (sum, customer) => sum + customerOrders(customer).length,
      0
    );

    const totalReviews = customers.reduce(
      (sum, customer) => sum + customerReviews(customer).length,
      0
    );

    const spending = customers.reduce((sum, customer) => {
      if (customer.totalSpent != null) {
        return sum + Number(customer.totalSpent || 0);
      }

      return (
        sum +
        customerOrders(customer)
          .filter(
            (order) =>
              !["CANCELLED", "REFUNDED"].includes(
                String(order.status ?? "").toUpperCase()
              )
          )
          .reduce((orderSum, order) => orderSum + orderAmount(order), 0)
      );
    }, 0);

    return {
      total: customers.length,
      active,
      orders: totalOrders,
      reviews: totalReviews,
      spending,
    };
  }, [customers]);

  async function openCustomer(customer) {
    setSelectedCustomer(customer);
    setDetailsLoading(true);
    setError("");
    setSuccess("");

    try {
      const id = customerId(customer);

      if (id == null) {
        throw new Error("Customer ID is missing.");
      }

      const response = await fetch(`${API_URL}/api/customers/${id}`);

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Could not load customer details (${response.status})`
        );
      }

      const details = await response.json();

      setSelectedCustomer((current) =>
        current && String(customerId(current)) === String(id)
          ? details
          : current
      );
    } catch (err) {
      // Keep the list record visible, but make the details API failure explicit.
      setError(`Customer details could not be fully loaded: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeCustomer() {
    setSelectedCustomer(null);
  }

  return (
    <main className="admin-customers-page">
      <div className="admin-customers-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
        <span>/</span>
        <span>Customers</span>
      </div>

      <header className="admin-customers-header">
        <div>
          <p className="admin-customers-eyebrow">CUSTOMER MANAGEMENT</p>
          <h1>Customers</h1>
          <p className="admin-customers-subtitle">
            Customer profiles, purchase history and product reviews.
          </p>
        </div>

        <button
          type="button"
          className="admin-customers-refresh"
          onClick={loadCustomers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Customers"}
        </button>
      </header>

      {error && (
        <div className="admin-customers-alert admin-customers-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-customers-alert admin-customers-alert-success">
          {success}
        </div>
      )}

      <section className="admin-customers-summary">
        <div className="admin-customers-stat">
          <span>Total Customers</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="admin-customers-stat">
          <span>Active Accounts</span>
          <strong>{summary.active}</strong>
        </div>

        <div className="admin-customers-stat">
          <span>Orders in Loaded Records</span>
          <strong>{summary.orders}</strong>
        </div>

        <div className="admin-customers-stat">
          <span>Reviews in Loaded Records</span>
          <strong>{summary.reviews}</strong>
        </div>

        <div className="admin-customers-stat">
          <span>Recorded Spending</span>
          <strong>{money(summary.spending)}</strong>
        </div>
      </section>

      <section className="admin-customers-table-card">
        <div className="admin-customers-table-heading">
          <div>
            <p className="admin-customers-eyebrow">CUSTOMER DIRECTORY</p>
            <h2>All Customers</h2>
          </div>

          <div className="admin-customers-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone or ID"
              aria-label="Search customers"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter customers by status"
            >
              <option value="ALL">All accounts</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-customers-empty">
            Loading customers from backend...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="admin-customers-empty">
            <span className="admin-customers-empty-icon">♙</span>
            <h3>No customers found</h3>
            <p>
              {customers.length === 0
                ? "The Customers API returned no records."
                : "Try changing the search term or account filter."}
            </p>
          </div>
        ) : (
          <div className="admin-customers-table-scroll">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Reviews</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => {
                  const id = customerId(customer);
                  const orders = customerOrders(customer);
                  const reviews = customerReviews(customer);

                  const spent =
                    customer.totalSpent != null
                      ? Number(customer.totalSpent)
                      : orders
                          .filter(
                            (order) =>
                              !["CANCELLED", "REFUNDED"].includes(
                                String(order.status ?? "").toUpperCase()
                              )
                          )
                          .reduce(
                            (total, order) => total + orderAmount(order),
                            0
                          );

                  const status = customerStatus(customer);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="admin-customers-person">
                          <div className="admin-customers-avatar">
                            {customerName(customer)
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{customerName(customer)}</strong>
                            <small>Customer #{id ?? "—"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{customer.email || "—"}</strong>
                        <small>
                          {customer.phone ?? customer.mobile ?? "—"}
                        </small>
                      </td>

                      <td>
                        {dateText(
                          customer.createdAt ??
                            customer.registeredAt ??
                            customer.createdDate
                        )}
                      </td>

                      <td>{customer.orderCount ?? orders.length}</td>

                      <td className="admin-customers-spending">
                        {money(spent)}
                      </td>

                      <td>{customer.reviewCount ?? reviews.length}</td>

                      <td>
                        <span className={statusClass(status)}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-customers-view-button"
                          onClick={() => openCustomer(customer)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="admin-customers-footer">
        <span>DIANORA</span>
        <span>Customer management</span>
      </footer>

      {selectedCustomer && (
        <div
          className="admin-customers-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCustomer();
          }}
        >
          <section
            className="admin-customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-customer-details-title"
          >
            <div className="admin-customers-modal-header">
              <div>
                <p className="admin-customers-eyebrow">CUSTOMER PROFILE</p>
                <h2 id="admin-customer-details-title">
                  {customerName(selectedCustomer)}
                </h2>
                <p>Customer #{customerId(selectedCustomer) ?? "—"}</p>
              </div>

              <button
                type="button"
                className="admin-customers-close"
                onClick={closeCustomer}
                aria-label="Close customer profile"
              >
                ×
              </button>
            </div>

            {detailsLoading && (
              <p className="admin-customers-loading-details">
                Loading latest customer details...
              </p>
            )}

            <section className="admin-customers-detail-section">
              <h3>Contact Information</h3>
              <div className="admin-customers-detail-grid">
                <div>
                  <span>Full Name</span>
                  <strong>{customerName(selectedCustomer)}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedCustomer.email || "Not provided"}</strong>
                </div>
                <div>
                  <span>Mobile</span>
                  <strong>
                    {selectedCustomer.phone ??
                      selectedCustomer.mobile ??
                      "Not provided"}
                  </strong>
                </div>
                <div>
                  <span>Registered On</span>
                  <strong>
                    {dateText(
                      selectedCustomer.createdAt ??
                        selectedCustomer.registeredAt ??
                        selectedCustomer.createdDate
                    )}
                  </strong>
                </div>
                <div>
                  <span>Account Status</span>
                  <strong>{customerStatus(selectedCustomer)}</strong>
                </div>
                <div>
                  <span>Total Spending</span>
                  <strong>
                    {money(
                      selectedCustomer.totalSpent ??
                        customerOrders(selectedCustomer)
                          .filter(
                            (order) =>
                              !["CANCELLED", "REFUNDED"].includes(
                                String(order.status ?? "").toUpperCase()
                              )
                          )
                          .reduce(
                            (total, order) => total + orderAmount(order),
                            0
                          )
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="admin-customers-detail-section">
              <h3>Addresses</h3>

              {Array.isArray(selectedCustomer.addresses) &&
              selectedCustomer.addresses.length > 0 ? (
                selectedCustomer.addresses.map((address, index) => (
                  <div className="admin-customers-address" key={index}>
                    {typeof address === "string"
                      ? address
                      : [
                          address.fullName,
                          address.addressLine1,
                          address.addressLine2,
                          address.address,
                          address.city,
                          address.state,
                          address.pinCode ?? address.postalCode,
                          address.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address details unavailable"}
                  </div>
                ))
              ) : (
                <div className="admin-customers-address">
                  {getAddress(selectedCustomer) ||
                    "No address returned by the API."}
                </div>
              )}
            </section>

            <section className="admin-customers-detail-section">
              <h3>
                Order History ({customerOrders(selectedCustomer).length})
              </h3>

              {customerOrders(selectedCustomer).length === 0 ? (
                <p className="admin-customers-no-data">
                  No orders were returned for this customer.
                </p>
              ) : (
                <div className="admin-customers-subtable-scroll">
                  <table className="admin-customers-subtable">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOrders(selectedCustomer).map((order, index) => (
                        <tr key={order.id ?? order.orderId ?? index}>
                          <td>#{order.id ?? order.orderId ?? "—"}</td>
                          <td>
                            {dateText(
                              order.createdAt ??
                                order.orderDate ??
                                order.createdDate
                            )}
                          </td>
                          <td>
                            {orderItems(order).reduce(
                              (sum, item) =>
                                sum + Number(item.quantity ?? 1),
                              0
                            )}
                          </td>
                          <td>{money(orderAmount(order))}</td>
                          <td>
                            {String(order.status ?? "UNKNOWN").toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-customers-detail-section">
              <h3>Product Reviews ({customerReviews(selectedCustomer).length})</h3>

              {customerReviews(selectedCustomer).length === 0 ? (
                <p className="admin-customers-no-data">
                  No reviews have been returned for this customer.
                </p>
              ) : (
                <div className="admin-customers-reviews">
                  {customerReviews(selectedCustomer).map((review, index) => {
                    const rating = reviewRating(review);

                    return (
                      <article
                        className="admin-customers-review"
                        key={review.id ?? review.reviewId ?? index}
                      >
                        <div className="admin-customers-review-top">
                          <div>
                            <strong>
                              {review.productName ??
                                review.product?.name ??
                                `Product #${review.productId ?? "—"}`}
                            </strong>
                            <span className="admin-customers-stars">
                              {rating > 0
                                ? `${"★".repeat(Math.min(5, rating))}${"☆".repeat(Math.max(0, 5 - rating))} (${rating}/5)`
                                : "Rating not provided"}
                            </span>
                          </div>
                          <time>
                            {dateText(
                              review.createdAt ??
                                review.reviewDate ??
                                review.createdDate
                            )}
                          </time>
                        </div>

                        <p>
                          {review.comment ??
                            review.reviewText ??
                            review.text ??
                            "No review text provided."}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="admin-customers-modal-actions">
              <button
                type="button"
                className="admin-customers-close-button"
                onClick={closeCustomer}
              >
                Close Profile
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
