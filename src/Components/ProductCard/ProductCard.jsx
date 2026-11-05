// import { Link } from "react-router-dom";
// import "./ProductCard.css";

// function ProductCard({ product }) {
//   const mainImage =
//     product.image ||
//     product.images?.[0] ||
//     "";

//   return (
//     <article className="product-card">
//       <Link
//         to={`/product/${product.id}`}
//         className="product-card-image-link"
//         aria-label={`View ${product.name}`}
//       >
//         <div className="product-card-image-wrap">
//           {mainImage ? (
//             <img
//               src={mainImage}
//               alt={product.name}
//               className="product-card-image"
//               loading="lazy"
//               onError={(event) => {
//                 event.currentTarget.style.display = "none";
//               }}
//             />
//           ) : (
//             <div className="product-card-no-image">
//               Image coming soon
//             </div>
//           )}

//           <span className="product-card-badge">
//             {Number(product.stock) <= 0 ? "SOLD OUT" : (product.badge || "DIANORA")}
//           </span>
//         </div>
//       </Link>

//       <div className="product-card-info">
//         <p className="product-card-category">
//           {product.category}
//         </p>

//         <Link
//           to={`/product/${product.id}`}
//           className="product-card-name"
//         >
//           {product.name}
//         </Link>

//         {Number.isFinite(Number(product.stock)) && (
//           <p className="product-card-stock" style={{ margin: "8px 0", fontSize: "13px", color: Number(product.stock) > 0 ? "#6b625b" : "#b42318" }}>
//             {Number(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock"}
//           </p>
//         )}

//         <div className="product-card-prices">
//           <span className="product-card-price">
//             ₹{product.price}
//           </span>

//           {product.originalPrice > product.price && (
//             <span className="product-card-original-price">
//               ₹{product.originalPrice}
//             </span>
//           )}
//         </div>

//         <Link
//           to={`/product/${product.id}`}
//           className="product-card-button"
//         >
//           VIEW PRODUCT
//         </Link>
//       </div>
//     </article>
//   );
// }

// export default ProductCard;


import { Link } from "react-router-dom";
import "./ProductCard.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function resolveImageUrl(value) {
  if (!value || typeof value !== "string") return "";
  const image = value.trim();
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function ProductCard({ product }) {
  const mainImage = resolveImageUrl(
    product.imageUrl || product.image || product.images?.[0] || ""
  );

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
                const fallback = event.currentTarget.parentElement?.querySelector(".product-card-no-image");
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="product-card-no-image"
            style={{ display: mainImage ? "none" : "flex" }}
          >
            Image coming soon
          </div>

          <span className="product-card-badge">
            {Number(product.stock) <= 0 ? "SOLD OUT" : (product.badge || "DIANORA")}
          </span>
        </div>
      </Link>

      <div className="product-card-info">
        <p className="product-card-category">
          {product.category || product.categoryName || product.category?.name || "Skincare"}
        </p>

        <Link to={`/product/${product.id}`} className="product-card-name">
          {product.name}
        </Link>

        {Number.isFinite(Number(product.stock)) && (
          <p className="product-card-stock" style={{ margin: "8px 0", fontSize: "13px", color: Number(product.stock) > 0 ? "#6b625b" : "#b42318" }}>
            {Number(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        )}

        <div className="product-card-prices">
          <span className="product-card-price">₹{product.price}</span>
          {Number(product.originalPrice) > Number(product.price) && (
            <span className="product-card-original-price">₹{product.originalPrice}</span>
          )}
        </div>

        <Link to={`/product/${product.id}`} className="product-card-button">
          VIEW PRODUCT
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;

