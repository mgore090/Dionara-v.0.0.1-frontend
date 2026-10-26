import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { notifyCartUpdated } from "../Components/Cart/cartUtils";
const CART_KEY = "dinoraCart";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Load cart from localStorage when the page opens
  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      setCartItems(Array.isArray(savedCart) ? savedCart : []);
    } catch (error) {
      console.error("Unable to load cart:", error);
      setCartItems([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  // Save updated cart and update the page
  // function saveCart(updatedCart) {
  //   try {
  //     localStorage.setItem(
  //       CART_KEY,
  //       JSON.stringify(updatedCart)
  //     );
  //     setCartItems(updatedCart);
  //   } catch (error) {
  //     console.error("Unable to save cart:", error);
  //     alert("Cart update failed. Please try again.");
  //   }
  // }
  
    function saveCart(updatedCart) {
      try {
        localStorage.setItem(
          "dinoraCart",
          JSON.stringify(updatedCart)
        );

        setCartItems(updatedCart);

        // Notify Navbar that cart data changed
        notifyCartUpdated();
      } catch (error) {
        console.error("Unable to save cart:", error);
        alert("Cart update failed. Please try again.");
      }
    }

  // Increase or decrease quantity
  function updateQuantity(id, change) {
    const updatedCart = cartItems
      .map((item) => {
        if (String(item.id) !== String(id)) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            Number(item.quantity || 1) + change
          ),
        };
      });

    saveCart(updatedCart);
  }

  // Remove one product from cart
  function removeItem(id) {
    const updatedCart = cartItems.filter(
      (item) => String(item.id) !== String(id)
    );

    saveCart(updatedCart);
  }

  // Clear all products from cart
  function clearCart() {
    if (window.confirm("Remove all products from your cart?")) {
      saveCart([]);
    }
  }

  // Calculate total quantity and price
  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  if (!cartLoaded) {
    return (
      <main className="cart-page">
        <p className="cart-loading">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <p className="cart-eyebrow">YOUR DIANORA SELECTION</p>
        <h1>Shopping Cart</h1>
        <p>
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
        </p>
      </header>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon">♡</div>
          <h2>Your cart is empty</h2>
          <p>
            Discover your skincare essentials and build your daily routine.
          </p>
          <Link to="/allProducts" className="cart-continue-button">
            CONTINUE SHOPPING
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-heading">
              <h2>Your Products</h2>

              <button
                type="button"
                className="cart-clear-button"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item) => (
              <article
                className="cart-item"
                key={item.id}
              >
                <Link
                  to={`/product/${item.id}`}
                  className="cart-item-image"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>No image</span>
                  )}
                </Link>

                <div className="cart-item-details">
                  <Link
                    to={`/product/${item.id}`}
                    className="cart-item-name"
                  >
                    {item.name}
                  </Link>

                  <p className="cart-item-price">
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </p>

                  <div className="cart-item-actions">
                    <div className="cart-quantity-control">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={Number(item.quantity || 1) <= 1}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span>{Number(item.quantity || 1)}</span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toLocaleString("en-IN")}
                </div>
              </article>
            ))}

            <Link to="/allProducts" className="cart-back-link">
              ← Continue Shopping
            </Link>
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <p className="cart-summary-note">
              Shipping charges, if applicable, will be confirmed before payment.
            </p>

            
            <Link to="/checkout" className="cart-checkout-button">
              PROCEED TO CHECKOUT
            </Link>

          </aside>
        </section>
      )}
    </main>
  );
}

export default Cart;
