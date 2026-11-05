import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCategories.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const EMPTY_FORM = {
  name: "",
  description: "",
};

function categoryStatus(category) {
  return category.active ? "ACTIVE" : "INACTIVE";
}

function errorMessage(body, fallback) {
  if (!body) return fallback;

  try {
    const parsed = JSON.parse(body);
    return parsed.detail || parsed.message || parsed.error || fallback;
  } catch {
    return body || fallback;
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      errorMessage(body, `Request failed (${response.status})`)
    );
  }

  if (response.status === 204) return null;

  return response.json();
}

export default function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`${API_URL}/api/categories`);

      if (!Array.isArray(data)) {
        throw new Error("Categories API did not return a list.");
      }

      setCategories(data);
    } catch (err) {
      setError(
        `${err.message}. Spring Boot server, API URL ani CORS check kara.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        [
          category.id,
          category.name,
          category.description,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        categoryStatus(category) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: categories.length,
      active: categories.filter((category) => category.active).length,
      inactive: categories.filter((category) => !category.active).length,
      products: categories.reduce(
        (sum, category) => sum + Number(category.productCount ?? 0),
        0
      ),
    };
  }, [categories]);

  function openCreateModal() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setForm({
      name: category.name ?? "",
      description: category.description ?? "",
    });
    setFormError("");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    if (name.length > 100) {
      setFormError("Category name cannot exceed 100 characters.");
      return;
    }

    if (description.length > 500) {
      setFormError("Description cannot exceed 500 characters.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name?.trim().toLowerCase() === name.toLowerCase() &&
        category.id !== editingCategory?.id
    );

    if (duplicate) {
      setFormError("A category with this name already exists.");
      return;
    }

    setSaving(true);

    try {
      const payload = { name, description: description || null };

      if (editingCategory) {
        await apiRequest(
          `${API_URL}/api/categories/${editingCategory.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess(`"${name}" category updated successfully.`);
      } else {
        await apiRequest(`${API_URL}/api/categories`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess(`"${name}" category created successfully.`);
      }

      setModalOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);

      await loadCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category) {
    const action = category.active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      category.active
        ? `Deactivate "${category.name}"? Products assigned to this category may prevent deactivation.`
        : `Activate "${category.name}"?`
    );

    if (!confirmed) return;

    setActionId(category.id);
    setError("");
    setSuccess("");

    try {
      if (category.active) {
        await apiRequest(
          `${API_URL}/api/categories/${category.id}`,
          { method: "DELETE" }
        );

        setSuccess(`"${category.name}" deactivated successfully.`);
      } else {
        // Current backend has no dedicated activation endpoint.
        // PUT updates name/description but does not set active=true.
        throw new Error(
          "Backend madhye category activate karanyasathi endpoint nahi. CategoryController madhye PATCH /{id}/activate endpoint add karava lagel."
        );
      }

      await loadCategories();
    } catch (err) {
      setError(`${action} failed: ${err.message}`);
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="admin-categories-page">
      <div className="admin-categories-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>
        <span>/</span>
        <span>Categories</span>
      </div>

      <header className="admin-categories-header">
        <div>
          <p className="admin-categories-eyebrow">CATALOGUE</p>
          <h1>Categories</h1>
          <p className="admin-categories-subtitle">
            Create and manage product categories.
          </p>
        </div>

        <div className="admin-categories-header-actions">
          <button
            type="button"
            className="admin-categories-secondary-button"
            onClick={loadCategories}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            className="admin-categories-primary-button"
            onClick={openCreateModal}
          >
            + Add Category
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-categories-alert admin-categories-alert-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="admin-categories-alert admin-categories-alert-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <section className="admin-categories-summary">
        <article className="admin-categories-stat">
          <span>Total Categories</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-categories-stat">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </article>
        <article className="admin-categories-stat">
          <span>Inactive</span>
          <strong>{summary.inactive}</strong>
        </article>
        <article className="admin-categories-stat">
          <span>Products Assigned</span>
          <strong>{summary.products}</strong>
        </article>
      </section>

      <section className="admin-categories-card">
        <div className="admin-categories-toolbar">
          <div>
            <p className="admin-categories-eyebrow">PRODUCT CATALOGUE</p>
            <h2>All Categories</h2>
            <p className="admin-categories-muted">
              {filteredCategories.length} of {categories.length} categories
            </p>
          </div>

          <div className="admin-categories-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter category status"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-categories-empty">
            Loading categories from backend...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="admin-categories-empty">
            <div className="admin-categories-empty-icon">◇</div>
            <h3>
              {categories.length === 0
                ? "No categories yet"
                : "No matching categories"}
            </h3>
            <p>
              {categories.length === 0
                ? "Create your first category to organize your products."
                : "Try another search term or change the status filter."}
            </p>
            {categories.length === 0 && (
              <button
                type="button"
                className="admin-categories-primary-button"
                onClick={openCreateModal}
              >
                + Create First Category
              </button>
            )}
          </div>
        ) : (
          <div className="admin-categories-table-wrap">
            <table className="admin-categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="admin-categories-id">
                      #{category.id}
                    </td>

                    <td>
                      <div className="admin-categories-name-cell">
                        <span className="admin-categories-category-icon">
                          ◇
                        </span>
                        <strong>{category.name}</strong>
                      </div>
                    </td>

                    <td className="admin-categories-description">
                      {category.description || "—"}
                    </td>

                    <td>
                      <span className="admin-categories-product-count">
                        {Number(category.productCount ?? 0)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-categories-status ${
                          category.active ? "is-active" : "is-inactive"
                        }`}
                      >
                        {category.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-categories-row-actions">
                        <button
                          type="button"
                          className="admin-categories-edit-button"
                          onClick={() => openEditModal(category)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={
                            category.active
                              ? "admin-categories-deactivate-button"
                              : "admin-categories-activate-button"
                          }
                          disabled={actionId === category.id}
                          onClick={() => toggleCategory(category)}
                        >
                          {actionId === category.id
                            ? "Working..."
                            : category.active
                              ? "Deactivate"
                              : "Activate"}
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

      <footer className="admin-categories-footer">
        <span>DIANORA</span>
        <span>Category management</span>
      </footer>

      {modalOpen && (
        <div
          className="admin-categories-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="admin-categories-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-categories-modal-title"
          >
            <header className="admin-categories-modal-header">
              <div>
                <p className="admin-categories-eyebrow">
                  CATEGORY MANAGEMENT
                </p>
                <h2 id="admin-categories-modal-title">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <p>
                  {editingCategory
                    ? "Update the category details below."
                    : "Create a category for your product catalogue."}
                </p>
              </div>

              <button
                type="button"
                className="admin-categories-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="admin-categories-alert admin-categories-alert-error">
                  {formError}
                </div>
              )}

              <div className="admin-categories-form-field">
                <label htmlFor="category-name">
                  Category Name <span>*</span>
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="e.g. Sun Protection"
                  maxLength={100}
                  required
                  autoFocus
                />
                <small>{form.name.length}/100 characters</small>
              </div>

              <div className="admin-categories-form-field">
                <label htmlFor="category-description">
                  Description
                </label>
                <textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the category..."
                  maxLength={500}
                  rows={4}
                />
                <small>{form.description.length}/500 characters</small>
              </div>

              <div className="admin-categories-form-note">
                <strong>Note:</strong> New categories are created as active.
                Category status is managed separately.
              </div>

              <div className="admin-categories-modal-actions">
                <button
                  type="button"
                  className="admin-categories-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-categories-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
