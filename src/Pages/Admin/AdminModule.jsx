import { Link, useParams } from "react-router-dom";

const moduleInfo = {
  products: {
    title: "Product Management",
    description: "Connect this page to GET, POST, PUT and DELETE /api/products.",
  },
  categories: {
    title: "Category Management",
    description: "Connect this page to your category APIs.",
  },
  orders: {
    title: "Order Management",
    description: "Order listing and status updates require backend order APIs.",
  },
  inventory: {
    title: "Inventory Management",
    description: "Stock management requires stock fields and backend APIs.",
  },
  customers: {
    title: "Customer Management",
    description: "Customer records require backend customer APIs.",
  },
};

export default function AdminModule() {
  const { module } = useParams();
  const info = moduleInfo[module];

  if (!info) {
    return <main><h1>Module not found</h1><Link to="/admin/dashboard">Back to dashboard</Link></main>;
  }

  return (
    <main style={{ padding: "40px 5%", background: "#f7f4f0", minHeight: "70vh" }}>
      <p style={{ color: "#9a7658", letterSpacing: "2px" }}>DIANORA ADMIN</p>
      <h1>{info.title}</h1>
      <p>{info.description}</p>
      <p>This is a placeholder, not a completed management module.</p>
      <Link to="/admin/dashboard">← Back to Dashboard</Link>
    </main>
  );
}
