import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  price: "",
  originalPrice: "",
  description: "",
  image: "",
  images: [],
  features: [""],
  size: "",
  stock: "",
};
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [pendingImagePreviews, setPendingImagePreviews] = useState([]);

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
        `${err.message}. Check Spring Boot, API URL and CORS settings.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [
        product.id,
        product.name,
        product.categoryName,
        product.category?.name,
        product.categoryId,
        product.size,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [products, search]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateListField(field, index, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, i) =>
        i === index ? value : item
      ),
    }));
  }

  function addListField(field) {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], ""],
    }));
  }

  function removeListField(field, index) {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, i) => i !== index),
    }));
  }

  function resolveImageUrl(url) {
    if (!url) return "";
    return url.startsWith("http") || url.startsWith("blob:") ? url : `${API_URL}${url}`;
  }

  function reorderExistingImage(imageUrl, requestedPosition) {
    const position = Number(requestedPosition);
    setForm((current) => {
      const images = (current.images || []).filter(Boolean);
      const currentIndex = images.indexOf(imageUrl);
      if (currentIndex < 0 || !Number.isInteger(position) || position < 1 || position > images.length) {
        return current;
      }

      const reordered = [...images];
      const [selected] = reordered.splice(currentIndex, 1);
      reordered.splice(position - 1, 0, selected);
      return { ...current, image: reordered[0] || "", images: reordered };
    });
    setImagePreview((current) => current === imageUrl ? imageUrl : current);
    setSuccess("Image display order updated. Click Save Changes to persist it.");
  }

  function setExistingImageAsMain(imageUrl) {
    setForm((current) => {
      const images = (current.images || []).filter(Boolean);
      const selected = images.find((image) => image === imageUrl);
      if (!selected) return current;
      const reorderedImages = [selected, ...images.filter((image) => image !== selected)];
      return { ...current, image: selected, images: reorderedImages };
    });
    setImagePreview(imageUrl);
    setSuccess("Main image changed. Other images are kept in order.");
  }

  async function removeExistingImage(imageUrl) {
    if (!editingId) {
      setForm((current) => ({ ...current, images: current.images.filter((image) => image !== imageUrl), image: current.image === imageUrl ? "" : current.image }));
      return;
    }
    if (!window.confirm("Remove this image from the product?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${editingId}/images?imageUrl=${encodeURIComponent(imageUrl)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text() || `Delete failed (${response.status})`);
      const updated = await response.json();
      const remaining = Array.isArray(updated.images) ? updated.images : [];
      setForm((current) => ({ ...current, image: updated.imageUrl || "", images: remaining }));
      setImagePreview(updated.imageUrl || "");
      setSuccess("Image removed. Main image updated if needed.");
      await loadProducts();
    } catch (err) {
      setError(`Could not remove image: ${err.message}`);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSelectedImageFiles([]);
    setImagePreview("");
    setPendingImagePreviews([]);
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setForm(EMPTY_FORM);
    setSelectedImageFiles([]);
    setImagePreview("");
    setPendingImagePreviews([]);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(product) {
    const productImages = Array.isArray(product.images)
      ? product.images
      : [];

    const productFeatures = Array.isArray(product.features)
      ? product.features
      : [];

    setForm({
      name: product.name ?? "",
      categoryId:
        product.categoryId ?? product.category?.id ?? "",
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      description: product.description ?? "",
      image: product.image ?? product.imageUrl ?? "",
      images: productImages.length ? productImages : (product.imageUrl ? [product.imageUrl] : []),
      features: productFeatures.length ? productFeatures : [""],
      size: product.size ?? "",
      stock: product.stock ?? "",
    });

    setSelectedImageFiles([]);
    setImagePreview(product.imageUrl ?? product.image ?? "");
    setPendingImagePreviews([]);
    setEditingId(product.id);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.categoryId || Number(form.categoryId) <= 0) {
      setError("Enter a valid existing Category ID.");
      return;
    }

    if (form.price === "" || !Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0) {
      setError("Enter a valid selling price.");
      return;
    }

    if (
      form.originalPrice !== "" &&
      Number(form.originalPrice) < Number(form.price)
    ) {
      setError("Original price should not be lower than selling price.");
      return;
    }

    if (form.stock !== "" && Number(form.stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    setSaving(true);

    let uploadedImageUrl = form.image.trim();
    let uploadedAdditionalImages = [];

    if (selectedImageFiles.length > 0) {
      try {
        const uploadResults = await Promise.all(
          selectedImageFiles.map(async (file) => {
            const imageFormData = new FormData();
            imageFormData.append("file", file);

            const uploadResponse = await fetch(`${API_URL}/api/products/upload-image`, {
              method: "POST",
              body: imageFormData,
            });

            if (!uploadResponse.ok) {
              const uploadDetails = await uploadResponse.text();
              throw new Error(uploadDetails || `Image upload failed (${uploadResponse.status})`);
            }

            const uploadResult = await uploadResponse.json();
            return uploadResult.imageUrl;
          })
        );

        uploadedImageUrl = uploadResults[0] || uploadedImageUrl;
        uploadedAdditionalImages = uploadResults.slice(1);
      } catch (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
    }

    const images = [
      uploadedImageUrl,
      ...(Array.isArray(form.images) ? form.images : []),
      ...uploadedAdditionalImages,
    ].map((url) => String(url).trim()).filter((url, index, all) => url && all.indexOf(url) === index);
    if (images.length > 10) {
      setError("Maximum 10 images per product.");
      setSaving(false);
      return;
    }

    const features = form.features
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      description: form.description.trim(),
      imageUrl: uploadedImageUrl,
      images,
      features,
      size: form.size.trim(),
    };

    if (form.originalPrice !== "") {
      payload.originalPrice = Number(form.originalPrice);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed (${response.status})`);
      }

      setSuccess(
        editingId
          ? "Product updated successfully."
          : "Product created successfully."
      );

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        `Product could not be saved: ${err.message}. Verify the fields in ProductRequest.java.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(product) {
    if (
      !window.confirm(
        `Are you sure you want to deactivate "${product.name}"?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/products/${product.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed (${response.status})`);
      }

      setSuccess(`"${product.name}" deactivated successfully.`);
      await loadProducts();
    } catch (err) {
      setError(`Could not deactivate product: ${err.message}`);
    }
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
        <span>/</span>
        <span>Products</span>
      </div>

      <header className="admin-products-header">
        <div>
          <p className="admin-products-eyebrow">PRODUCT MANAGEMENT</p>
          <h1>Products</h1>
          <p className="admin-products-subtitle">
            Manage the complete DIANORA skincare catalogue.
          </p>
        </div>

        <button
          type="button"
          className="admin-products-add-button"
          onClick={openAddForm}
        >
          + ADD PRODUCT
        </button>
      </header>

      {error && (
        <div className="admin-products-alert admin-products-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-products-alert admin-products-alert-success">
          {success}
        </div>
      )}

      {showForm && (
        <section className="admin-products-form-card">
          <div className="admin-products-form-heading">
            <div>
              <p className="admin-products-eyebrow">
                {editingId ? "EDIT CATALOGUE ITEM" : "NEW CATALOGUE ITEM"}
              </p>
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            </div>

            <button
              type="button"
              className="admin-products-close-button"
              onClick={resetForm}
              aria-label="Close product form"
            >
              ×
            </button>
          </div>

          <form className="admin-products-form" onSubmit={handleSubmit}>
            <label>
              Product Name *
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Dinora Moisturizer"
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
                onChange={updateField}
                placeholder="Existing category ID"
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
                onChange={updateField}
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
                onChange={updateField}
                placeholder="249"
              />
            </label>

            <label>
              Product Size
              <input
                name="size"
                value={form.size}
                onChange={updateField}
                placeholder="20 ml"
              />
            </label>

            <label>
              Stock Quantity
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={updateField}
                placeholder="50"
              />
            </label>

            <label className="admin-products-full-width">
              Description
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={updateField}
                placeholder="Enter the full product description..."
              />
            </label>

            <div className="admin-products-full-width admin-products-image-upload">
              <label htmlFor="mainProductImage">Main Product Image</label>
              <input
                id="mainProductImage"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (!files.length) return;

                  if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
                    setError("Only JPG, PNG or WebP images are allowed.");
                    event.target.value = "";
                    return;
                  }

                  if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
                    setError(`Image size must be ${MAX_IMAGE_SIZE} MB or less.`);
                    event.target.value = "";
                    return;
                  }

                  setError("");
                  const currentCount = (form.images || []).filter(Boolean).length;
                  if (currentCount + files.length > 10) {
                    setError(`Maximum 10 images total. Existing: ${currentCount}.`);
                    event.target.value = "";
                    return;
                  }
                  setSelectedImageFiles(files);
                  setPendingImagePreviews(files.map((file) => URL.createObjectURL(file)));
                  setImagePreview(URL.createObjectURL(files[0]));
                }}
              />
              <p className="admin-products-image-help">
                Select an image from your computer (JPG, PNG or WebP, maximum 5 MB).
                It will be uploaded to the backend when you save the product.
              </p>

              {(form.images || []).filter(Boolean).length > 0 && (
                <div className="admin-products-image-preview admin-products-image-gallery">
                  <strong>Saved product images ({(form.images || []).filter(Boolean).length}/10)</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                    {(form.images || []).filter(Boolean).map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} style={{ display: "flex", flexDirection: "column", gap: "6px", width: "120px" }}>
                        <img src={resolveImageUrl(imageUrl)} alt={`Product image ${index + 1}`} style={{ width: "100px", height: "120px", objectFit: "contain", border: "1px solid #ddd" }} />
                        <small>{index === 0 ? "Main image" : `Image ${index + 1}`}</small>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                          Display order
                          <input
                            type="number"
                            min="1"
                            max={(form.images || []).filter(Boolean).length}
                            value={index + 1}
                            aria-label={`Display order for image ${index + 1}`}
                            style={{ width: "54px", padding: "5px" }}
                            onChange={(event) => reorderExistingImage(imageUrl, event.target.value)}
                          />
                        </label>
                        <button type="button" className="admin-products-remove-button" onClick={() => removeExistingImage(imageUrl)}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingImagePreviews.length > 0 && (
                <div className="admin-products-image-preview">
                  <strong>New selected images (will upload on Save)</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                    {pendingImagePreviews.map((preview, index) => <img key={preview} src={preview} alt={`New image ${index + 1}`} style={{ width: "100px", height: "120px", objectFit: "contain", border: "1px solid #ddd" }} />)}
                  </div>
                </div>
              )}
              {imagePreview && !((form.images || []).filter(Boolean).length > 0) && (
                <div className="admin-products-image-preview">
                  <span>Main image preview</span>
                  <img
                    src={imagePreview.startsWith("blob:")
                      ? imagePreview
                      : imagePreview.startsWith("http")
                        ? imagePreview
                        : `${API_URL}${imagePreview}`}
                    alt="Product preview"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    className="admin-products-remove-button"
                    onClick={() => {
                      setSelectedImageFiles([]);
                      setImagePreview("");
                      setForm((current) => ({ ...current, image: "" }));
                    }}
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>

            <div className="admin-products-list-editor admin-products-full-width">
              <div className="admin-products-list-heading">
                <div>
                  <h3>Product Features</h3>
                  <p>Add every product feature separately.</p>
                </div>
                <button
                  type="button"
                  className="admin-products-small-button"
                  onClick={() => addListField("features")}
                >
                  + Add Feature
                </button>
              </div>

              {form.features.map((feature, index) => (
                <div className="admin-products-dynamic-row" key={`feature-${index}`}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(event) =>
                      updateListField("features", index, event.target.value)
                    }
                    placeholder={`Feature ${index + 1}`}
                  />
                  {form.features.length > 1 && (
                    <button
                      type="button"
                      className="admin-products-remove-button"
                      onClick={() => removeListField("features", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="admin-products-form-actions admin-products-full-width">
              <button
                type="submit"
                className="admin-products-add-button"
                disabled={saving}
              >
                {saving
                  ? "SAVING..."
                  : editingId
                  ? "SAVE CHANGES"
                  : "CREATE PRODUCT"}
              </button>

              <button
                type="button"
                className="admin-products-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                CANCEL
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-products-summary">
        <div>
          <span>Products returned by backend</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Matching search results</span>
          <strong>{filteredProducts.length}</strong>
        </div>
      </section>

      <section className="admin-products-table-card">
        <div className="admin-products-table-heading">
          <div>
            <p className="admin-products-eyebrow">YOUR CATALOGUE</p>
            <h2>All Products</h2>
          </div>

          <div className="admin-products-search-wrap">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button
              type="button"
              className="admin-products-refresh-button"
              onClick={loadProducts}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-products-empty">
            Loading products from backend...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-products-empty">
            <h3>No products found</h3>
            <p>
              {search
                ? "Try a different search."
                : "No products were returned by the API."}
            </p>
          </div>
        ) : (
          <div className="admin-products-table-scroll">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-products-product-cell">
                        {product.image || product.imageUrl ? (
                          <img
                            src={resolveImageUrl(product.image || product.imageUrl || "")}
                            alt={product.name}
                            className="admin-products-thumbnail"
                          />
                        ) : (
                          <div className="admin-products-product-placeholder">
                            {(product.name || "P").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.description || "No description"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.categoryName ??
                        product.category?.name ??
                        product.categoryId ??
                        product.category?.id ??
                        "—"}
                    </td>
                    <td>{product.size || "—"}</td>
                    <td className="admin-products-price">
                      <strong>₹{product.price ?? "—"}</strong>
                      {product.originalPrice != null && (
                        <small className="admin-products-original-price">
                          ₹{product.originalPrice}
                        </small>
                      )}
                    </td>
                    <td>{product.stock ?? "—"}</td>
                    <td>
                      <div className="admin-products-row-actions">
                        <button
                          type="button"
                          className="admin-products-edit-button"
                          onClick={() => openEditForm(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-products-deactivate-button"
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

      <footer className="admin-products-footer">
        <span>DIANORA</span>
        <span>Product catalogue management</span>
      </footer>
    </main>
  );
}

