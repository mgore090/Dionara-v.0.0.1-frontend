import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const modules = [
  {
    icon: "📦",
    title: "Products",
    description: "Add, edit and deactivate skincare products.",
    path: "/admin/products",
    label: "PRODUCT MANAGEMENT",
  },
  {
    icon: "🏷️",
    title: "Categories",
    description: "Create and manage product categories.",
    path: "/admin/categories",
    label: "CATALOGUE",
  },
  {
    icon: "🛍️",
    title: "Orders",
    description: "View customer orders and manage order status.",
    path: "/admin/orders",
    label: "ORDER MANAGEMENT",
  },
  {
    icon: "📊",
    title: "Inventory",
    description: "Monitor stock levels and product availability.",
    path: "/admin/inventory",
    label: "STOCK CONTROL",
  },
  {
    icon: "👥",
    title: "Customers",
    description: "View customer records and order history.",
    path: "/admin/customers",
    label: "CUSTOMER MANAGEMENT",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  function logoutDemo() {
    sessionStorage.removeItem("dinoraAdminDemo");
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand-mark">D</span>
          <div>
            <h2>DIANORA</h2>
            <span>STORE ADMINISTRATION</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <span className="admin-status">
            <span className="admin-status-dot" />
            Demo Mode
          </span>

          <button
            type="button"
            className="admin-logout-button"
            onClick={logoutDemo}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="admin-welcome">
        <div>
          <p className="admin-eyebrow">STORE MANAGEMENT</p>
          <h1>Welcome to DIANORA Admin</h1>
          <p className="admin-welcome-description">
            Manage products, categories, orders, inventory and customers
            from one place.
          </p>
        </div>

        <div className="admin-welcome-mark" aria-hidden="true">
          D.
        </div>
      </section>

      <section className="admin-overview">
        <div className="admin-overview-item">
          <span>Management Modules</span>
          <strong>{modules.length}</strong>
        </div>

        <div className="admin-overview-item">
          <span>Store</span>
          <strong>DIANORA</strong>
        </div>

        <div className="admin-overview-item">
          <span>Panel Status</span>
          <strong className="admin-demo-text">Demo</strong>
        </div>
      </section>

      <section className="admin-manage-section">
        <div className="admin-section-title">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h2>Manage Your Store</h2>
          </div>

          <p className="admin-section-caption">
            Select a module to continue
          </p>
        </div>

        <div className="admin-module-grid">
          {modules.map((module) => (
            <article className="admin-module-card" key={module.path}>
              <div className="admin-module-card-top">
                <span className="admin-module-icon" aria-hidden="true">
                  {module.icon}
                </span>
                <span className="admin-module-label">{module.label}</span>
              </div>

              <h3>{module.title}</h3>
              <p>{module.description}</p>

              <button
                type="button"
                className="admin-module-button"
                onClick={() => navigate(module.path)}
              >
                OPEN MODULE <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="admin-dashboard-footer">
        <span>DIANORA</span>
        <span>Store Administration Portal</span>
      </footer>
    </main>
  );
}
