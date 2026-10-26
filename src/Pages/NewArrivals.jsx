
import "./AllProducts.css";
import "./NewArrivals.css";

import products from "../data/products";
import ProductCard from "../Components/ProductCard/ProductCard";

function NewArrivals() {
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

          <span>Explore the DIANORA collection</span>
        </div>

        {products.length > 0 ? (
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
