"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id?: string;
  name: string;
  price: number | string;
  description?: string | null;
  imageUrl?: string;
  image?: string;
  category: string;
  event?: string | null;
};

const oldProducts: Product[] = [
  {
    name: "Rose Elegance",
    price: 1,
    description: "A timeless arrangement of premium roses.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
    event: "General",
  },
  {
    name: "Pastel Dream",
    price: 1799,
    description:
      "Soft seasonal blooms in a beautiful pastel palette.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
    event: "General",
  },
  {
    name: "Sunshine",
    price: 1299,
    description:
      "Bright flowers designed to make someone's day.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
    event: "General",
  },
  {
    name: "Luxury Gift Box",
    price: 999,
    description:
      "A beautiful gift box for birthdays and special moments.",
    image: "/images/premium-gift-box.png",
    category: "Gifts",
    event: "Birthday",
  },
  {
    name: "Love Gift Set",
    price: 1199,
    description:
      "A thoughtful gift set made for someone special.",
    image: "/images/rose-bouquete.png",
    category: "Gifts",
    event: "Anniversary",
  },
];

export default function Home() {
  const [products, setProducts] =
    useState<Product[]>(oldProducts);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [event, setEvent] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          return;
        }

        const databaseProducts: Product[] =
          await response.json();

        setProducts(databaseProducts);
      } catch (error) {
        console.error(
          "Unable to load products:",
          error
        );
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      product.category === category;

    const matchesEvent =
      event === "All" ||
      product.event === event;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesEvent
    );
  });

  return (
    <main>
      {/* Navigation */}
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            AURVINO
          </Link>

          <nav>
            <Link href="#bouquets">Bouquets</Link>
            <Link href="#about">About</Link>
            <Link href="#contact">Contact</Link>

            <Link
              href="/track"
              style={{
                fontWeight: 700,
                color: "#71384e",
              }}
            >
              Track Order
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">
            AURVINO FLOWER BOUTIQUE
          </p>

          <h1>
            Flowers,
            <br />
            thoughtfully arranged.
          </h1>

          <p className="hero-text">
            Elegant bouquets created with care for
            birthdays, celebrations, romance and every
            beautiful moment.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              href="#bouquets"
              className="primary-button"
            >
              Explore Bouquets
            </Link>

            <Link
              href="/track"
              className="primary-button"
              style={{
                background: "#ffffff",
                color: "#71384e",
                border: "1px solid #dccbd1",
              }}
            >
              Track Your Order
            </Link>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="bouquets" className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              OUR COLLECTION
            </p>

            <h2>
              Beautiful flowers and gifts for every
              occasion
            </h2>

            <p>
              Discover our carefully selected bouquets
              and gifts, made for your special moments.
            </p>
          </div>

          {/* Search */}
          <div className="product-search">
            <input
              type="text"
              placeholder="Search bouquets, gifts..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search bouquets and gifts"
            />
          </div>

          {/* Categories */}
          <div className="category-buttons">
            <button
              type="button"
              className={
                category === "All" ? "active" : ""
              }
              onClick={() => setCategory("All")}
            >
              All
            </button>

            <button
              type="button"
              className={
                category === "Bouquets"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory("Bouquets")
              }
            >
              🌸 Bouquets
            </button>

            <button
              type="button"
              className={
                category === "Gifts"
                  ? "active"
                  : ""
              }
              onClick={() => setCategory("Gifts")}
            >
              🎁 Gifts
            </button>
          </div>

          {/* Events */}
          <div className="category-buttons">
            <button
              type="button"
              className={
                event === "All" ? "active" : ""
              }
              onClick={() => setEvent("All")}
            >
              All Events
            </button>

            <button
              type="button"
              className={
                event === "Birthday"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Birthday")
              }
            >
              🎂 Birthday
            </button>

            <button
              type="button"
              className={
                event === "Anniversary"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Anniversary")
              }
            >
              💕 Anniversary
            </button>

            <button
              type="button"
              className={
                event === "Wedding"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Wedding")
              }
            >
              💍 Wedding
            </button>

            <button
              type="button"
              className={
                event === "Valentine's Day"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Valentine's Day")
              }
            >
              ❤️ Valentine's Day
            </button>

            <button
              type="button"
              className={
                event === "Baby Shower"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Baby Shower")
              }
            >
              🍼 Baby Shower
            </button>

            <button
              type="button"
              className={
                event === "Graduation"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Graduation")
              }
            >
              🎓 Graduation
            </button>

            <button
              type="button"
              className={
                event === "Other Events"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("Other Events")
              }
            >
              🎉 Other Events
            </button>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 ? (
            <div className="bouquet-grid">
              {filteredProducts.map(
                (product, index) => {
                  const image =
                    product.imageUrl ||
                    product.image ||
                    "/images/rose-bouquete.png";

                  const price =
                    typeof product.price ===
                    "number"
                      ? product.price
                      : Number(product.price);

                  return (
                    <article
                      className="bouquet-card"
                      key={
                        product.id ||
                        `${product.name}-${index}`
                      }
                    >
                      <div className="bouquet-image">
                        <img
                          src={image}
                          alt={product.name}
                          className="bouquet-photo"
                        />
                      </div>

                      <div className="bouquet-info">
                        <span className="product-category">
                          {product.category}
                        </span>

                        <h3>{product.name}</h3>

                        <p>
                          {product.description ||
                            "Beautifully arranged with care for your special moment."}
                        </p>

                        <div className="card-bottom">
                          <strong>
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <Link
                            href={`/bookings?product=${encodeURIComponent(
                              product.name
                            )}`}
                            className="book-button"
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="no-results">
              <h3>No products found</h3>

              <p>
                Try searching for another bouquet,
                gift or event.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="about-section"
      >
        <div className="container about-content">
          <div>
            <p className="eyebrow">
              ABOUT AURVINO
            </p>

            <h2>
              Made to make moments beautiful.
            </h2>
          </div>

          <p>
            At Aurvino, we believe flowers are more
            than a gift. They are a way to express
            love, gratitude, celebration and everything
            that words sometimes cannot say.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="section contact-section"
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              GET IN TOUCH
            </p>

            <h2>
              Let&apos;s make something beautiful.
            </h2>

            <p>
              Have a special request or need a custom
              bouquet? Contact Aurvino and we&apos;ll be
              happy to help.
            </p>

            <a
              href="https://wa.me/919380507626"
              className="primary-button"
            >
              Contact Aurvino
            </a>

            <a
              href="https://wa.me/919845507955"
              className="primary-button"
            >
              WhatsApp: 98455 07955
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo">AURVINO</div>

          <p>
            © 2026 Aurvino Flower Boutique. All
            rights reserved.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/track"
              className="admin-login-link"
            >
              Track Order
            </Link>

            <a
              href="/admin/login"
              className="admin-login-link"
            >
              Admin Login
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}