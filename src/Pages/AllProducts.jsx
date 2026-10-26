
import "./AllProducts.css";
import products from "../data/products";
import ProductCard from "../Components/ProductCard/ProductCard";

function AllProducts() {
  return (
    <main className="all-products-page">
      <section className="all-products-heading">
        <p className="all-products-eyebrow">DISCOVER DIANORA</p>
        <h1>All Products</h1>
        <p>
          Everyday skincare essentials for your daily glow.
        </p>
      </section>

      <section className="all-products-section">
        <div className="all-products-toolbar">
          <p>{products.length} Products</p>
          <span>Made for your daily skincare routine</span>
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
            Products will be available soon.
          </p>
        )}
      </section>
    </main>
  );
}

export default AllProducts;
