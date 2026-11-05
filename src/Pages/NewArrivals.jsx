import { useEffect, useState } from "react";

import "./AllProducts.css";
import "./NewArrivals.css";

import ProductCard from "../Components/ProductCard/ProductCard";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function normalizeProduct(product) {
  return {
    ...product,
    image: product.image || product.imageUrl || "",
    images: Array.isArray(product.images)
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [],
    category:
      product.categoryName ||
      product.category?.name ||
      "Skincare",
  };
}

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            `Products API failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Products API did not return a product list."
          );
        }

        const normalizedProducts =
          data.map(normalizeProduct);

        // Temporary: show backend products until
        // the backend has an isNew/newArrival field.
        setProducts(normalizedProducts);
      } catch (err) {
        console.error("New arrivals fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="new-arrivals-page">
      <section className="new-arrivals-heading">
        <p className="new-arrivals-eyebrow">
          JUST FOR YOUR GLOW
        </p>

        <h1>New Arrivals</h1>

        <p>
          Discover your skincare favourites from DIANORA.
        </p>
      </section>

      <section className="all-products-section">
        <div className="all-products-toolbar">
          <p>{products.length} Products</p>

          <span>
            Explore the DIANORA collection
          </span>
        </div>

        {loading ? (
          <p className="no-products">
            Loading new arrivals...
          </p>
        ) : error ? (
          <p className="no-products">
            Unable to load products: {error}
          </p>
        ) : products.length > 0 ? (
          <div className="all-products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <p className="no-products">
            New products coming soon.
          </p>
        )}
      </section>
    </main>
  );
}

export default NewArrivals;