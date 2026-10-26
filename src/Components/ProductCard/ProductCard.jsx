
import { Link } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
  const mainImage =
    product.image ||
    product.images?.[0] ||
    "";

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-card-image-wrap">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="product-card-image"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-card-no-image">
              Image coming soon
            </div>
          )}

          <span className="product-card-badge">
            {product.badge || "DIANORA"}
          </span>
        </div>
      </Link>

      <div className="product-card-info">
        <p className="product-card-category">
          {product.category}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="product-card-name"
        >
          {product.name}
        </Link>

        <div className="product-card-prices">
          <span className="product-card-price">
            ₹{product.price}
          </span>

          {product.originalPrice > product.price && (
            <span className="product-card-original-price">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="product-card-button"
        >
          VIEW PRODUCT
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
