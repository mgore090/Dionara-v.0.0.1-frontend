// import { Link, useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import "./Product.css";

// const API_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// function mapProduct(data) {
//   const rawImageUrl = data.imageUrl ?? data.image ?? "";
//   const imageUrl = rawImageUrl && !rawImageUrl.startsWith("http")
//     ? `${API_URL}${rawImageUrl}`
//     : rawImageUrl;

//   const images = Array.isArray(data.images)
//     ? data.images.filter(Boolean)
//     : [];

//   const productImages = images.length > 0
//     ? images
//     : imageUrl
//       ? [imageUrl]
//       : [];

//   return {
//     id: data.id,
//     name: data.name ?? "",
//     category:
//       data.categoryName ??
//       data.category?.name ??
//       data.category ??
//       "Skincare",
//     price: Number(data.price ?? 0),
//     originalPrice: Number(data.originalPrice ?? 0),
//     description: data.description ?? "",
//     image: imageUrl || productImages[0] || "",
//     images: productImages,
//     features: Array.isArray(data.features) ? data.features : [],
//     size: data.size ?? "",
//     stock: Number(data.stock ?? data.stockQuantity ?? 0),
//     active: data.active ?? true,
//   };
// }

// function Product() {
//   const { productId } = useParams();
//   const navigate = useNavigate();

//   const [product, setProduct] = useState(null);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let isMounted = true;

//     async function fetchProduct() {
//       setLoading(true);
//       setError("");
//       setProduct(null);
//       setSelectedImage(0);
//       setQuantity(1);

//       try {
//         const response = await fetch(
//           `${API_URL}/api/products/${productId}`
//         );

//         if (!response.ok) {
//           if (response.status === 404) {
//             throw new Error("Product not found.");
//           }

//           throw new Error(
//             `Unable to fetch product. Status: ${response.status}`
//           );
//         }

//         const data = await response.json();
//         const mappedProduct = mapProduct(data);

//         if (!mappedProduct.active) {
//           throw new Error("This product is currently unavailable.");
//         }

//         if (isMounted) {
//           setProduct(mappedProduct);
//         }
//       } catch (err) {
//         console.error("Product API error:", err);

//         if (isMounted) {
//           setError(
//             err.message ||
//             "Unable to load product. Please try again."
//           );
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchProduct();

//     return () => {
//       isMounted = false;
//     };
//   }, [productId]);

//   const productImages = product?.images ?? [];

//   if (loading) {
//     return (
//       <main className="product-not-found">
//         <p>Loading product...</p>
//       </main>
//     );
//   }

//   if (error || !product) {
//     return (
//       <main className="product-not-found">
//         <h1>Product Not Found</h1>
//         <p>{error || "This product may have been removed."}</p>
//         <Link to="/allProducts">Back to All Products</Link>
//       </main>
//     );
//   }

//   function getSavedCart() {
//     const savedCart = JSON.parse(
//       localStorage.getItem("dinoraCart") || "[]"
//     );

//     if (!Array.isArray(savedCart)) {
//       throw new Error("Invalid cart data");
//     }

//     return savedCart;
//   }

//   function addProductToCart() {
//     const savedCart = getSavedCart();

//     const existingProduct = savedCart.find(
//       (item) => String(item.id) === String(product.id)
//     );

//     if (existingProduct) {
//       existingProduct.quantity =
//         Number(existingProduct.quantity || 0) + quantity;

//       existingProduct.image =
//         product.image || productImages[0] || "";
//     } else {
//       savedCart.push({
//         id: product.id,
//         name: product.name,
//         price: product.price,
//         image: product.image || productImages[0] || "",
//         quantity,
//       });
//     }

//     localStorage.setItem(
//       "dinoraCart",
//       JSON.stringify(savedCart)
//     );
//   }

//   function handleAddToCart() {
//     try {
//       addProductToCart();
//       setMessage("Product added to your cart!");
//     } catch (err) {
//       console.error("Unable to update cart:", err);
//       setMessage("Unable to add product. Please try again.");
//     }
//   }

//   function handleBuyNow() {
//     try {
//       addProductToCart();
//       navigate("/checkout");
//     } catch (err) {
//       console.error("Unable to proceed to checkout:", err);
//       setMessage("Unable to proceed. Please try again.");
//     }
//   }

//   return (
//     <main className="product-details-page">
//       <div className="product-breadcrumb">
//         <Link to="/">Home</Link>
//         <span>/</span>
//         <Link to="/allProducts">All Products</Link>
//         <span>/</span>
//         <span>{product.name}</span>
//       </div>

//       <section className="product-details">
//         <div className="product-gallery">
//           <div className="product-details-image">
//             {productImages.length > 0 ? (
//               <>
//                 <img
//                   key={productImages[selectedImage]}
//                   src={productImages[selectedImage]}
//                   alt={`${product.name} image ${selectedImage + 1}`}
//                 />

//                 {productImages.length > 1 && (
//                   <>
//                     <button
//                       type="button"
//                       className="product-image-arrow product-image-prev"
//                       aria-label="Previous image"
//                       onClick={() =>
//                         setSelectedImage(
//                           (current) =>
//                             (current - 1 + productImages.length) %
//                             productImages.length
//                         )
//                       }
//                     >
//                       &#10094;
//                     </button>

//                     <button
//                       type="button"
//                       className="product-image-arrow product-image-next"
//                       aria-label="Next image"
//                       onClick={() =>
//                         setSelectedImage(
//                           (current) =>
//                             (current + 1) % productImages.length
//                         )
//                       }
//                     >
//                       &#10095;
//                     </button>
//                   </>
//                 )}
//               </>
//             ) : (
//               <p>Product image coming soon</p>
//             )}
//           </div>

//           {productImages.length > 1 && (
//             <div className="product-image-thumbnails">
//               {productImages.map((image, index) => (
//                 <button
//                   type="button"
//                   key={`${product.id}-image-${index}`}
//                   className={
//                     selectedImage === index
//                       ? "product-thumbnail active"
//                       : "product-thumbnail"
//                   }
//                   onClick={() => setSelectedImage(index)}
//                   aria-label={`View image ${index + 1}`}
//                 >
//                   <img
//                     src={image}
//                     alt={`${product.name} ${index + 1}`}
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="product-details-info">
//           <p className="product-details-category">
//             {product.category}
//           </p>

//           <h1>{product.name}</h1>

//           <div className="product-details-prices">
//             <span className="product-details-price">
//               ₹{product.price}
//             </span>

//             {product.originalPrice > product.price && (
//               <span className="product-details-original-price">
//                 ₹{product.originalPrice}
//               </span>
//             )}
//           </div>

//           <p className="product-details-description">
//             {product.description}
//           </p>

//           {product.size && (
//             <div className="product-details-size">
//               <strong>Size:</strong> {product.size}
//             </div>
//           )}

//           {product.features.length > 0 && (
//             <div className="product-details-features">
//               <h3>Product Highlights</h3>

//               <ul>
//                 {product.features.map((feature, index) => (
//                   <li key={`${product.id}-feature-${index}`}>
//                     {feature}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <div className="product-quantity">
//             <span>Quantity</span>

//             <div className="quantity-control">
//               <button
//                 type="button"
//                 aria-label="Decrease quantity"
//                 disabled={quantity <= 1}
//                 onClick={() =>
//                   setQuantity((current) =>
//                     Math.max(1, current - 1)
//                   )
//                 }
//               >
//                 −
//               </button>

//               <span>{quantity}</span>

//               <button
//                 type="button"
//                 aria-label="Increase quantity"
//                 disabled={
//                   product.stock > 0 &&
//                   quantity >= product.stock
//                 }
//                 onClick={() =>
//                   setQuantity((current) =>
//                     product.stock > 0
//                       ? Math.min(product.stock, current + 1)
//                       : current + 1
//                   )
//                 }
//               >
//                 +
//               </button>
//             </div>
//           </div>

//           <p className="product-total">
//             Total: ₹{product.price * quantity}
//           </p>

//           {product.stock <= 0 && (
//             <p className="product-cart-message">
//               Out of Stock
//             </p>
//           )}

//           <div className="product-purchase-actions">
//             <button
//               type="button"
//               className="product-add-to-cart"
//               disabled={product.stock <= 0}
//               onClick={handleAddToCart}
//             >
//               ADD TO CART
//             </button>

//             <button
//               type="button"
//               className="product-buy-now"
//               disabled={product.stock <= 0}
//               onClick={handleBuyNow}
//             >
//               BUY NOW
//             </button>
//           </div>

//           {message && (
//             <p className="product-cart-message" role="status">
//               {message}
//             </p>
//           )}

//           <p className="product-details-note">
//             Please check the product packaging for ingredients,
//             directions, and usage information.
//           </p>
//         </div>
//       </section>
//     </main>
//   );
// }

// export default Product;





import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Product.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function mapProduct(data) {
  const imageUrl = data.imageUrl ?? data.image ?? "";

  const images = Array.isArray(data.images)
    ? data.images.filter(Boolean)
    : [];

  const rawImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
  const productImages = rawImages.map((image) =>
    image.startsWith("http") ? image : `${API_URL}${image}`
  );

  return {
    id: data.id,
    name: data.name ?? "",
    category:
      data.categoryName ??
      data.category?.name ??
      data.category ??
      "Skincare",
    price: Number(data.price ?? 0),
    originalPrice: Number(data.originalPrice ?? 0),
    description: data.description ?? "",
    image: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`) : productImages[0] || "",
    images: productImages,
    features: Array.isArray(data.features) ? data.features : [],
    size: data.size ?? "",
    stock: Number(data.stock ?? data.stockQuantity ?? 0),
    active: data.active ?? true,
  };
}

function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setSelectedImage(0);
      setQuantity(1);

      try {
        const response = await fetch(
          `${API_URL}/api/products/${productId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found.");
          }

          throw new Error(
            `Unable to fetch product. Status: ${response.status}`
          );
        }

        const data = await response.json();
        const mappedProduct = mapProduct(data);

        if (!mappedProduct.active) {
          throw new Error("This product is currently unavailable.");
        }

        if (isMounted) {
          setProduct(mappedProduct);
        }
      } catch (err) {
        console.error("Product API error:", err);

        if (isMounted) {
          setError(
            err.message ||
            "Unable to load product. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const productImages = product?.images ?? [];

  if (loading) {
    return (
      <main className="product-not-found">
        <p>Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-not-found">
        <h1>Product Not Found</h1>
        <p>{error || "This product may have been removed."}</p>
        <Link to="/allProducts">Back to All Products</Link>
      </main>
    );
  }

  function getSavedCart() {
    const savedCart = JSON.parse(
      localStorage.getItem("dinoraCart") || "[]"
    );

    if (!Array.isArray(savedCart)) {
      throw new Error("Invalid cart data");
    }

    return savedCart;
  }

  function addProductToCart() {
    const savedCart = getSavedCart();

    const existingProduct = savedCart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (existingProduct) {
      existingProduct.quantity =
        Number(existingProduct.quantity || 0) + quantity;

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
  }

  function handleAddToCart() {
    try {
      addProductToCart();
      setMessage("Product added to your cart!");
    } catch (err) {
      console.error("Unable to update cart:", err);
      setMessage("Unable to add product. Please try again.");
    }
  }

  function handleBuyNow() {
    try {
      addProductToCart();
      navigate("/checkout");
    } catch (err) {
      console.error("Unable to proceed to checkout:", err);
      setMessage("Unable to proceed. Please try again.");
    }
  }

  return (
    <main className="product-details-page">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/allProducts">All Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-details">
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
                        setSelectedImage(
                          (current) =>
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
                        setSelectedImage(
                          (current) =>
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
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

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

          {product.features.length > 0 && (
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
                disabled={
                  product.stock > 0 &&
                  quantity >= product.stock
                }
                onClick={() =>
                  setQuantity((current) =>
                    product.stock > 0
                      ? Math.min(product.stock, current + 1)
                      : current + 1
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <p className="product-total">
            Total: ₹{product.price * quantity}
          </p>

          {product.stock <= 0 && (
            <p className="product-cart-message">
              Out of Stock
            </p>
          )}

          <div className="product-purchase-actions">
            <button
              type="button"
              className="product-add-to-cart"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>

            <button
              type="button"
              className="product-buy-now"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
            >
              BUY NOW
            </button>
          </div>

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