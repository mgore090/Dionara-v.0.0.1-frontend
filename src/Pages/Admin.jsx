
import { useCallback, useEffect, useState } from "react";
import "./Admin.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  imageUrl: "",
  stock: "",
};

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error(`Could not load products (${response.status})`);
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        `${err.message}. Check that Spring Boot is running and the API URL is correct.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function startEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      categoryId: product.categoryId ?? "",
      imageUrl: product.imageUrl ?? "",
      stock: product.stock ?? "",
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid product price.");
      return;
    }

    if (!form.categoryId || Number(form.categoryId) <= 0) {
      setError("Enter a valid Category ID.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      categoryId: Number(form.categoryId),
    };

    // Include these fields if they exist in your ProductRequest DTO.
    if (form.originalPrice !== "") {
      payload.originalPrice = Number(form.originalPrice);
    }
    if (form.imageUrl.trim()) {
      payload.imageUrl = form.imageUrl.trim();
    }
    if (form.stock !== "") {
      payload.stock = Number(form.stock);
    }

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Request failed with status ${response.status}`
        );
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        `Could not save product: ${err.message}. Check ProductRequest fields and backend validation.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/products/${product.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Request failed with status ${response.status}`
        );
      }

      setMessage("Product deactivated successfully.");
      await loadProducts();
    } catch (err) {
      setError(`Could not deactivate product: ${err.message}`);
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();

    return (
      String(product.name ?? "").toLowerCase().includes(query) ||
      String(product.categoryName ?? "").toLowerCase().includes(query) ||
      String(product.id ?? "").includes(query)
    );
  });

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">DIANORA SKIN CARE</p>
          <h1>Admin Panel</h1>
          <p className="admin-subtitle">
            Manage your products and inventory.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadProducts}
        >
          Refresh Products
        </button>
      </header>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total products loaded</span>
          <strong>{products.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Products in search</span>
          <strong>{filteredProducts.length}</strong>
        </article>
      </section>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-alert admin-alert-success" role="status">
          {message}
        </div>
      )}

      <section className="admin-panel-card">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">
              {editingId ? "EDIT PRODUCT" : "PRODUCT MANAGEMENT"}
            </p>
            <h2>{editingId ? "Update Product" : "Add New Product"}</h2>
          </div>
        </div>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <label>
            Product Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Moisture + Suncream"
              required
            />
          </label>

          <label>
            Category ID *
            <input
              name="categoryId"
              type="number"
              min="1"
              value={form.categoryId}
              onChange={handleChange}
              placeholder="Enter existing category ID"
              required
            />
          </label>

          <label>
            Selling Price (₹) *
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="199"
              required
            />
          </label>

          <label>
            Original Price (₹)
            <input
              name="originalPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={handleChange}
              placeholder="249"
            />
          </label>

          <label>
            Stock Quantity
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="20"
            />
          </label>

          <label>
            Product Image URL
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <label className="admin-full-width">
            Description
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
            />
          </label>

          <div className="admin-form-actions admin-full-width">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "UPDATE PRODUCT"
                : "ADD PRODUCT"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
              >
                CANCEL EDIT
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel-card">
        <div className="admin-section-heading admin-list-heading">
          <div>
            <p className="admin-eyebrow">YOUR CATALOGUE</p>
            <h2>Manage Products</h2>
          </div>

          <input
            className="admin-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, category or ID..."
            aria-label="Search products"
          />
        </div>

        {loading ? (
          <p className="admin-empty">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="admin-empty">
            No products found. Check the API or try another search.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <small>{product.description}</small>
                      )}
                    </td>
                    <td>
                      {product.categoryName ??
                        product.category?.name ??
                        product.categoryId ??
                        "—"}
                    </td>
                    <td>₹{product.price ?? "—"}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => startEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => deactivateProduct(product)}
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
