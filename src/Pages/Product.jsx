
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import "./Product.css";

function Product() {
  const { productId } = useParams();

  const product = products.find(
    (item) => String(item.id) === String(productId)
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");

  // Use the product's gallery images.
  // If no gallery exists, use its main image.
  const productImages = product
    ? product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : []
    : [];

  // Handle invalid product URL
  if (!product) {
    return (
      <main className="product-not-found">
        <h1>Product Not Found</h1>
        <p>
          This product may have been removed or is unavailable.
        </p>
        <Link to="/allProducts">
          Back to All Products
        </Link>
      </main>
    );
  }

  // Add product to localStorage cart
  function handleAddToCart() {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("dinoraCart") || "[]"
      );

      if (!Array.isArray(savedCart)) {
        throw new Error("Invalid cart data");
      }

      const existingProduct = savedCart.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existingProduct) {
        existingProduct.quantity =
          Number(existingProduct.quantity || 0) + quantity;

        // Update image in case the cart expects the main image
        existingProduct.image =
          product.image || productImages[0] || "";
      } else {
        savedCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || productImages[0] || "",
          quantity,
        });
      }

      localStorage.setItem(
        "dinoraCart",
        JSON.stringify(savedCart)
      );

      setMessage("Product added to your cart!");
    } catch (error) {
      console.error("Unable to update cart:", error);
      setMessage("Unable to add product. Please try again.");
    }
  }

  return (
    <main className="product-details-page">
      {/* Breadcrumb navigation */}
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/allProducts">All Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-details">
        {/* Product image gallery */}
        
      <div className="product-gallery">
        <div className="product-details-image">
          {productImages.length > 0 ? (
            <>
              <img
                key={productImages[selectedImage]}
                src={productImages[selectedImage]}
                alt={`${product.name} image ${selectedImage + 1}`}
              />

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="product-image-arrow product-image-prev"
                    aria-label="Previous image"
                    onClick={() =>
                      setSelectedImage((current) =>
                        (current - 1 + productImages.length) %
                        productImages.length
                      )
                    }
                  >
                    &#10094;
                  </button>

                  <button
                    type="button"
                    className="product-image-arrow product-image-next"
                    aria-label="Next image"
                    onClick={() =>
                      setSelectedImage((current) =>
                        (current + 1) % productImages.length
                      )
                    }
                  >
                    &#10095;
                  </button>
                </>
              )}
            </>
          ) : (
            <p>Product image coming soon</p>
          )}
        </div>

        {productImages.length > 1 && (
          <div className="product-image-thumbnails">
            {productImages.map((image, index) => (
              <button
                type="button"
                key={`${product.id}-image-${index}`}
                className={
                  selectedImage === index
                    ? "product-thumbnail active"
                    : "product-thumbnail"
                }
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>


        {/* Product information */}
        <div className="product-details-info">
          <p className="product-details-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <div className="product-details-prices">
            <span className="product-details-price">
              ₹{product.price}
            </span>

            {product.originalPrice > product.price && (
              <span className="product-details-original-price">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <p className="product-details-description">
            {product.description}
          </p>

          {product.size && (
            <div className="product-details-size">
              <strong>Size:</strong> {product.size}
            </div>
          )}

          {product.features?.length > 0 && (
            <div className="product-details-features">
              <h3>Product Highlights</h3>

              <ul>
                {product.features.map((feature, index) => (
                  <li key={`${product.id}-feature-${index}`}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity selector */}
          <div className="product-quantity">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Total price */}
          <p className="product-total">
            Total: ₹{product.price * quantity}
          </p>

          {/* Add to cart */}
          <button
            type="button"
            className="product-add-to-cart"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </button>

          {message && (
            <p className="product-cart-message" role="status">
              {message}
            </p>
          )}

          <p className="product-details-note">
            Please check the product packaging for ingredients,
            directions, and usage information.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Product;
