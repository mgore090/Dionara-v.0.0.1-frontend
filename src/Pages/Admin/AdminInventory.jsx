import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminInventory.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getStock(product) {
  return Number(product.stock ?? product.stockQuantity ?? 0);
}

function getProductCategory(product) {
  return (
    product.categoryName ??
    product.category?.name ??
    product.categoryId ??
    product.category?.id ??
    "Uncategorized"
  );
}

function getStockStatus(stock) {
  if (stock <= 0) return "OUT OF STOCK";
  if (stock <= 10) return "LOW STOCK";
  return "IN STOCK";
}

function getStatusClass(status) {
  return `admin-inventory-status admin-inventory-status-${status
    .toLowerCase()
    .replaceAll(" ", "-")}`;
}

export default function AdminInventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("ADD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error(`Could not load products (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The Products API did not return a list.");
      }

      setProducts(data);
    } catch (err) {
      setError(
        `${err.message}. Check Spring Boot, the API URL and CORS settings.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const summary = useMemo(() => {
    const totalUnits = products.reduce(
      (total, product) => total + Math.max(0, getStock(product)),
      0
    );

    return {
      products: products.length,
      units: totalUnits,
      low: products.filter((product) => {
        const stock = getStock(product);
        return stock > 0 && stock <= 10;
      }).length,
      out: products.filter((product) => getStock(product) <= 0).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = getStock(product);
      const status = getStockStatus(stock);

      const matchesSearch =
        !query ||
        [
          product.id,
          product.name,
          product.sku,
          getProductCategory(product),
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesFilter =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && status === "IN STOCK") ||
        (stockFilter === "LOW_STOCK" && status === "LOW STOCK") ||
        (stockFilter === "OUT_OF_STOCK" && status === "OUT OF STOCK");

      return matchesSearch && matchesFilter;
    });
  }, [products, search, stockFilter]);

  function openAdjustment(product) {
    setAdjustingProduct(product);
    setAdjustmentType("ADD");
    setQuantity("");
    setReason("");
    setError("");
    setSuccess("");
  }

  function closeAdjustment() {
    if (saving) return;
    setAdjustingProduct(null);
    setQuantity("");
    setReason("");
  }
  function getStatusClass(status) {
  return `admin-inventory-status admin-inventory-status-${status
    .toLowerCase()
    .replaceAll(" ", "-")}`;
}

  async function submitAdjustment(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!adjustingProduct) return;

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a positive whole-number quantity.");
      return;
    }

    if (!reason.trim()) {
      setError("Enter a reason for the stock adjustment.");
      return;
    }

    const currentStock = getStock(adjustingProduct);
    const newStock =
      adjustmentType === "ADD"
        ? currentStock + amount
        : currentStock - amount;

    if (newStock < 0) {
      setError(`Insufficient stock. Current stock is ${currentStock}.`);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/products/${adjustingProduct.id}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: adjustmentType,
            quantity: amount,
            reason: reason.trim(),
          }),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details ||
            `Stock update failed (${response.status}). Verify that the stock API exists.`
        );
      }

      setSuccess(
        `Stock adjustment saved for ${adjustingProduct.name}.`
      );
      setAdjustingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(`Could not update stock: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-inventory-page">
      <div className="admin-inventory-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
        <span>/</span>
        <span>Inventory</span>
      </div>

      <header className="admin-inventory-header">
        <div>
          <p className="admin-inventory-eyebrow">STOCK CONTROL</p>
          <h1>Inventory</h1>
          <p className="admin-inventory-subtitle">
            Monitor stock levels and product availability.
          </p>
        </div>

        <button
          type="button"
          className="admin-inventory-refresh"
          onClick={loadProducts}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Stock"}
        </button>
      </header>

      {error && (
        <div className="admin-inventory-alert admin-inventory-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-inventory-alert admin-inventory-alert-success">
          {success}
        </div>
      )}

      <section className="admin-inventory-summary">
        <button
          type="button"
          className={`admin-inventory-stat ${stockFilter === "ALL" ? "is-active" : ""}`}
          onClick={() => setStockFilter("ALL")}
        >
          <span>Total Products</span>
          <strong>{summary.products}</strong>
        </button>

        <div className="admin-inventory-stat">
          <span>Total Units in Stock</span>
          <strong>{summary.units}</strong>
        </div>

        <button
          type="button"
          className={`admin-inventory-stat ${stockFilter === "LOW_STOCK" ? "is-active" : ""}`}
          onClick={() => setStockFilter("LOW_STOCK")}
        >
          <span>Low Stock (1–10)</span>
          <strong>{summary.low}</strong>
        </button>

        <button
          type="button"
          className={`admin-inventory-stat ${stockFilter === "OUT_OF_STOCK" ? "is-active" : ""}`}
          onClick={() => setStockFilter("OUT_OF_STOCK")}
        >
          <span>Out of Stock</span>
          <strong>{summary.out}</strong>
        </button>
      </section>

      <section className="admin-inventory-table-card">
        <div className="admin-inventory-table-heading">
          <div>
            <p className="admin-inventory-eyebrow">INVENTORY OVERVIEW</p>
            <h2>Product Stock</h2>
          </div>

          <div className="admin-inventory-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU or category..."
              aria-label="Search inventory"
            />

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              aria-label="Filter inventory by stock status"
            >
              <option value="ALL">All stock</option>
              <option value="IN_STOCK">In stock</option>
              <option value="LOW_STOCK">Low stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-inventory-empty">
            Loading inventory from backend...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-inventory-empty">
            <span className="admin-inventory-empty-icon">▥</span>
            <h3>No inventory items found</h3>
            <p>
              {products.length === 0
                ? "No products were returned by the Products API."
                : "Try changing your search or stock filter."}
            </p>
          </div>
        ) : (
          <div className="admin-inventory-table-scroll">
            <table className="admin-inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU / ID</th>
                  <th>Category</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock = getStock(product);
                  const status = getStockStatus(stock);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-inventory-product-cell">
                          {product.image || product.imageUrl ? (
                            <img
                              src={product.image || product.imageUrl}
                              alt={product.name || "Product"}
                              className="admin-inventory-thumbnail"
                            />
                          ) : (
                            <div className="admin-inventory-product-placeholder">
                              {(product.name || "P").slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <strong>{product.name || "Unnamed product"}</strong>
                            <small>
                              {product.size || "Size not specified"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{product.sku || product.id || "—"}</td>
                      <td>{getProductCategory(product)}</td>

                      <td>
                        <strong className="admin-inventory-stock-number">
                          {stock}
                        </strong>
                        <small>units</small>
                      </td>

                      <td>
                        <span className={getStatusClass(status)}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-inventory-adjust-button"
                          onClick={() => openAdjustment(product)}
                        >
                          Adjust Stock
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

      <footer className="admin-inventory-footer">
        <span>DIANORA</span>
        <span>Inventory and stock control</span>
      </footer>

      {adjustingProduct && (
        <div
          className="admin-inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdjustment();
            }
          }}
        >
          <section
            className="admin-inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-inventory-modal-title"
          >
            <div className="admin-inventory-modal-header">
              <div>
                <p className="admin-inventory-eyebrow">STOCK ADJUSTMENT</p>
                <h2 id="admin-inventory-modal-title">
                  {adjustingProduct.name}
                </h2>
                <p>
                  Current stock: <strong>{getStock(adjustingProduct)} units</strong>
                </p>
              </div>

              <button
                type="button"
                className="admin-inventory-close"
                onClick={closeAdjustment}
                disabled={saving}
                aria-label="Close stock adjustment"
              >
                ×
              </button>
            </div>

            <form
              className="admin-inventory-adjust-form"
              onSubmit={submitAdjustment}
            >
              <label>
                Adjustment Type *
                <select
                  value={adjustmentType}
                  onChange={(event) => setAdjustmentType(event.target.value)}
                >
                  <option value="ADD">Add stock</option>
                  <option value="REMOVE">Remove stock</option>
                </select>
              </label>

              <label>
                Quantity *
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter units"
                  required
                />
              </label>

              <label>
                Reason *
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. New stock received, damaged items..."
                  required
                />
              </label>

              <div className="admin-inventory-projected">
                <span>Expected stock after adjustment</span>
                <strong>
                  {quantity !== "" &&
                  Number.isInteger(Number(quantity)) &&
                  Number(quantity) > 0
                    ? getStock(adjustingProduct) +
                      (adjustmentType === "ADD"
                        ? Number(quantity)
                        : -Number(quantity))
                    : getStock(adjustingProduct)}{" "}
                  units
                </strong>
              </div>

              <div className="admin-inventory-modal-actions">
                <button
                  type="button"
                  className="admin-inventory-cancel"
                  onClick={closeAdjustment}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-inventory-confirm"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
