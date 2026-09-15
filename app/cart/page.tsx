"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartProduct = {
  id?: string;
  name: string;
  price: number | string;
  description?: string | null;
  imageUrl?: string;
  image?: string;
  category: string;
  event?: string | null;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("Aurivon-cart") || "[]"
      );

      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }
  }, []);

  function removeFromCart(indexToRemove: number) {
    const updatedCart = cart.filter(
      (_, index) => index !== indexToRemove
    );

    setCart(updatedCart);

    localStorage.setItem(
      "Aurivon-cart",
      JSON.stringify(updatedCart)
    );
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("Aurivon-cart");
  }

  const total = cart.reduce((sum, product) => {
    const price =
      typeof product.price === "number"
        ? product.price
        : Number(product.price);

    return sum + price;
  }, 0);

  return (
    <main>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Aurivon
          </Link>

          <nav>
            <Link href="/">Home</Link>
            <Link href="/track">Track Order</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">YOUR SHOPPING CART</p>

            <h1>Your Cart 🛒</h1>

            <p>
              Review your selected flowers and gifts
              before continuing.
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="no-results">
              <h2>Your cart is empty</h2>

              <p>
                Add a beautiful bouquet or gift to get
                started.
              </p>

              <Link
                href="/#bouquets"
                className="primary-button"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  maxWidth: "850px",
                  margin: "0 auto",
                }}
              >
                {cart.map((product, index) => {
                  const image =
                    product.imageUrl ||
                    product.image ||
                    "/images/rose-bouquete.png";

                  const price =
                    typeof product.price === "number"
                      ? product.price
                      : Number(product.price);

                  return (
                    <article
                      key={`${product.id || product.name}-${index}`}
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                        padding: "18px",
                        background: "#ffffff",
                        border: "1px solid #eadde1",
                        borderRadius: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <img
                        src={image}
                        alt={product.name}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                          minWidth: "200px",
                        }}
                      >
                        <span className="product-category">
                          {product.category}
                        </span>

                        <h2
                          style={{
                            margin: "6px 0",
                          }}
                        >
                          {product.name}
                        </h2>

                        <p>
                          {product.description ||
                            "Beautifully arranged with care for your special moment."}
                        </p>

                        <strong
                          style={{
                            fontSize: "20px",
                            color: "#71384e",
                          }}
                        >
                          ₹{price.toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="book-button"
                        onClick={() =>
                          removeFromCart(index)
                        }
                      >
                        Remove
                      </button>
                    </article>
                  );
                })}
              </div>

              <div
                style={{
                  maxWidth: "850px",
                  margin: "30px auto 0",
                  padding: "24px",
                  background: "#ffffff",
                  border: "1px solid #eadde1",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                      }}
                    >
                      CART TOTAL
                    </p>

                    <h2
                      style={{
                        margin: "6px 0 0",
                        color: "#71384e",
                      }}
                    >
                      ₹{total.toLocaleString("en-IN")}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="book-button"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/#bouquets"
                    className="primary-button"
                  >
                    Continue Shopping
                  </Link>

                  <Link
                    href="/bookings"
                    className="primary-button"
                    style={{
                      background: "#71384e",
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    🛒 Proceed to Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo">Aurivon</div>

          <p>
            © 2026 Aurivon Flower Boutique. All
            rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}