import { useEffect, useState } from "react";
import "./AllProducts.css";
import ProductCard from "../Components/ProductCard/ProductCard";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function resolveImageUrl(value) {
  if (!value || typeof value !== "string") return "";
  const image = value.trim();
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function normalizeProduct(product) {
  const savedImages = Array.isArray(product.images)
    ? product.images.map((image) =>
        typeof image === "string" ? image : image?.imageUrl || image?.url || ""
      ).filter(Boolean)
    : [];

  const mainImage = product.imageUrl || product.image || savedImages[0] || "";

  return {
    ...product,
    image: resolveImageUrl(mainImage),
    images: savedImages.map(resolveImageUrl),
    category: product.categoryName || product.category?.name || "Skincare",
  };
}

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error(`Products API failed: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Products API did not return a product list.");
        }

        if (!cancelled) setProducts(data.filter((product) => product.active !== false).map(normalizeProduct));
      } catch (err) {
        console.error("Products fetch error:", err);
        if (!cancelled) setError(err.message || "Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="all-products-page">
      <section className="all-products-heading">
        <p className="all-products-eyebrow">DISCOVER DIANORA</p>
        <h1>All Products</h1>
        <p>Everyday skincare essentials for your daily glow.</p>
      </section>

      <section className="all-products-section">
        <div className="all-products-toolbar">
          <p>{products.length} Products</p>
          <span>Made for your daily skincare routine</span>
        </div>

        {loading ? (
          <p className="no-products">Loading DIANORA products...</p>
        ) : error ? (
          <p className="no-products">Unable to load products: {error}</p>
        ) : products.length > 0 ? (
          <div className="all-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="no-products">Products will be available soon.</p>
        )}
      </section>
    </main>
  );
}

export default AllProducts;
