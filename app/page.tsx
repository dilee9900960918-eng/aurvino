"use client";

import Link from "next/link";
import { useState } from "react";

const products = [
  {
    name: "Rose Elegance",
    price: "₹1,499",
    description: "A timeless arrangement of premium roses.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
  },
  {
    name: "Pastel Dream",
    price: "₹1,799",
    description: "Soft seasonal blooms in a beautiful pastel palette.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
  },
  {
    name: "Sunshine",
    price: "₹1,299",
    description: "Bright flowers designed to make someone's day.",
    image: "/images/rose-bouquete.png",
    category: "Bouquets",
  },
  {
    name: "Luxury Gift Box",
    price: "₹999",
    description: "A beautiful gift box for birthdays and special moments.",
    image: "/images/rose-bouquete.png",
    category: "Gifts",
  },
  {
    name: "Love Gift Set",
    price: "₹1,199",
    description: "A thoughtful gift set made for someone special.",
    image: "/images/rose-bouquete.png",
    category: "Gifts",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
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
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">AURVINO FLOWER BOUTIQUE</p>

          <h1>
            Flowers,
            <br />
            thoughtfully arranged.
          </h1>

          <p className="hero-text">
            Elegant bouquets created with care for birthdays,
            celebrations, romance and every beautiful moment.
          </p>

          <Link href="#bouquets" className="primary-button">
            Explore Bouquets
          </Link>
        </div>
      </section>

      {/* Collection */}
      <section id="bouquets" className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">OUR COLLECTION</p>

            <h2>Beautiful flowers and gifts for every occasion</h2>

            <p>
              Discover our carefully selected bouquets and gifts,
              made for your special moments.
            </p>
          </div>

          {/* Search */}
          <div className="product-search">
            <input
              type="text"
              placeholder="Search bouquets, gifts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search bouquets and gifts"
            />
          </div>

          {/* Categories */}
          <div className="category-buttons">
            <button
              type="button"
              className={category === "All" ? "active" : ""}
              onClick={() => setCategory("All")}
            >
              All
            </button>

            <button
              type="button"
              className={category === "Bouquets" ? "active" : ""}
              onClick={() => setCategory("Bouquets")}
            >
              🌸 Bouquets
            </button>

            <button
              type="button"
              className={category === "Gifts" ? "active" : ""}
              onClick={() => setCategory("Gifts")}
            >
              🎁 Gifts
            </button>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 ? (
            <div className="bouquet-grid">
              {filteredProducts.map((product) => (
                <article className="bouquet-card" key={product.name}>
                  <div className="bouquet-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="bouquet-photo"
                    />
                  </div>

                  <div className="bouquet-info">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p>{product.description}</p>

                    <div className="card-bottom">
                      <strong>{product.price}</strong>

                      <Link
                        href="/bookings"
                        className="book-button"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try searching for another bouquet or gift.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="container about-content">
          <div>
            <p className="eyebrow">ABOUT AURVINO</p>

            <h2>Made to make moments beautiful.</h2>
          </div>

          <p>
            At Aurvino, we believe flowers are more than a gift.
            They are a way to express love, gratitude, celebration and
            everything that words sometimes cannot say.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">GET IN TOUCH</p>

            <h2>Let&apos;s make something beautiful.</h2>

            <p>
              Have a special request or need a custom bouquet?
              Contact Aurvino and we&apos;ll be happy to help.
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
              WhatsApp: 9845507955
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo">AURVINO</div>

          <p>© 2026 Aurvino Flower Boutique. All rights reserved.</p>

          <a href="/admin/login" className="admin-login-link">
            Admin Login
          </a>
        </div>
      </footer>
    </main>
  );
}