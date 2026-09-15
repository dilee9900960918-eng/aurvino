"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
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

  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

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

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("Aurivon-cart") || "[]"
      );

      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      }
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );
    }

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("Aurivon-wishlist") || "[]"
      );

      if (Array.isArray(savedWishlist)) {
        setWishlist(savedWishlist);
      }
    } catch (error) {
      console.error(
        "Unable to load wishlist:",
        error
      );
    }

    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews");

        if (!response.ok) {
          return;
        }

        const databaseReviews: Review[] =
          await response.json();

        setReviews(databaseReviews);
      } catch (error) {
        console.error(
          "Unable to load reviews:",
          error
        );
      }
    }

    loadReviews();
  }, []);

  function addToCart(product: Product) {
    const updatedCart = [...cart, product];

    localStorage.setItem(
      "Aurivon-cart",
      JSON.stringify(updatedCart)
    );

    setCart(updatedCart);

    alert(`${product.name} added to cart 🛒`);
  }

  function isInWishlist(product: Product) {
    return wishlist.some(
      (item) =>
        (item.id &&
          product.id &&
          item.id === product.id) ||
        item.name === product.name
    );
  }

  function toggleWishlist(product: Product) {
    let updatedWishlist: Product[];

    if (isInWishlist(product)) {
      updatedWishlist = wishlist.filter(
        (item) =>
          !(
            (item.id &&
              product.id &&
              item.id === product.id) ||
            item.name === product.name
          )
      );
    } else {
      updatedWishlist = [
        ...wishlist,
        product,
      ];
    }

    localStorage.setItem(
      "Aurivon-wishlist",
      JSON.stringify(updatedWishlist)
    );

    setWishlist(updatedWishlist);
  }

  function addWishlistItemToCart(
    product: Product
  ) {
    const updatedCart = [
      ...cart,
      product,
    ];

    localStorage.setItem(
      "Aurivon-cart",
      JSON.stringify(updatedCart)
    );

    setCart(updatedCart);

    alert(`${product.name} added to cart 🛒`);
  }

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setReviewMessage("");

    const name = reviewName.trim();
    const comment = reviewComment.trim();

    if (name.length < 2) {
      setReviewMessage(
        "Please enter your name."
      );
      return;
    }

    if (comment.length < 5) {
      setReviewMessage(
        "Please write a little more about your experience."
      );
      return;
    }

    setReviewLoading(true);

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            rating: reviewRating,
            comment,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setReviewMessage(
          data.error ||
            "Unable to submit review."
        );
        return;
      }

      setReviewName("");
      setReviewRating(5);
      setReviewComment("");

      setReviewMessage(
        "Thank you! Your review has been submitted and is waiting for approval. ⭐"
      );
    } catch (error) {
      console.error(
        "Unable to submit review:",
        error
      );

      setReviewMessage(
        "Unable to submit review. Please try again."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  const filteredProducts =
    products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        category === "All" ||
        product.category ===
          category;

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
          <Link
            href="/"
            className="logo"
          >
            Aurivon
          </Link>

          <nav>
            <Link href="#bouquets">
              Bouquets
            </Link>

            <Link href="#wishlist">
              Wishlist
            </Link>

            <Link href="#reviews">
              Reviews
            </Link>

            <Link href="#about">
              About
            </Link>

            <Link href="#contact">
              Contact
            </Link>

            <Link
              href="/track"
              style={{
                fontWeight: 700,
                color: "#71384e",
              }}
            >
              Track Order
            </Link>

            <Link
              href="#wishlist"
              style={{
                fontWeight: 700,
                color: "#71384e",
              }}
            >
              ❤️ Wishlist (
              {wishlist.length})
            </Link>

            <Link
              href="/cart"
              style={{
                fontWeight: 700,
                color: "#71384e",
              }}
            >
              🛒 Cart ({cart.length})
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">
            Aurivon FLOWER BOUTIQUE
          </p>

          <h1>
            Flowers,
            <br />
            thoughtfully arranged.
          </h1>

          <p className="hero-text">
            Elegant bouquets created
            with care for birthdays,
            celebrations, romance and
            every beautiful moment.
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
                border:
                  "1px solid #dccbd1",
              }}
            >
              Track Your Order
            </Link>

            <Link
              href="#wishlist"
              className="primary-button"
              style={{
                background: "#ffffff",
                color: "#71384e",
                border:
                  "1px solid #dccbd1",
              }}
            >
              ❤️ Wishlist (
              {wishlist.length})
            </Link>

            <Link
              href="/cart"
              className="primary-button"
              style={{
                background: "#ffffff",
                color: "#71384e",
                border:
                  "1px solid #dccbd1",
              }}
            >
              🛒 View Cart (
              {cart.length})
            </Link>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section
        id="bouquets"
        className="section"
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              OUR COLLECTION
            </p>

            <h2>
              Beautiful flowers and
              gifts for every occasion
            </h2>

            <p>
              Discover our carefully
              selected bouquets and
              gifts, made for your
              special moments.
            </p>
          </div>

          {/* Search */}
          <div className="product-search">
            <input
              type="text"
              placeholder="Search bouquets, gifts..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Search bouquets and gifts"
            />
          </div>

          {/* Categories */}
          <div className="category-buttons">
            <button
              type="button"
              className={
                category === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory("All")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                category ===
                "Bouquets"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(
                  "Bouquets"
                )
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
              onClick={() =>
                setCategory("Gifts")
              }
            >
              🎁 Gifts
            </button>
          </div>

          {/* Events */}
          <div className="category-buttons">
            <button
              type="button"
              className={
                event === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent("All")
              }
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
                setEvent(
                  "Anniversary"
                )
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
                event ===
                "Valentine's Day"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent(
                  "Valentine's Day"
                )
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
                setEvent(
                  "Baby Shower"
                )
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
                setEvent(
                  "Graduation"
                )
              }
            >
              🎓 Graduation
            </button>

            <button
              type="button"
              className={
                event ===
                "Other Events"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setEvent(
                  "Other Events"
                )
              }
            >
              🎉 Other Events
            </button>
          </div>
                    {/* Product Grid */}
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

                        <div
                          className="card-bottom"
                          style={{
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong>
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems:
                                "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleWishlist(
                                  product
                                )
                              }
                              aria-label={
                                isInWishlist(
                                  product
                                )
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              title={
                                isInWishlist(
                                  product
                                )
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              style={{
                                border:
                                  "1px solid #dccbd1",
                                background:
                                  isInWishlist(
                                    product
                                  )
                                    ? "#fff0f4"
                                    : "#ffffff",
                                color:
                                  "#71384e",
                                borderRadius:
                                  "8px",
                                padding:
                                  "8px 10px",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "18px",
                              }}
                            >
                              {isInWishlist(
                                product
                              )
                                ? "❤️"
                                : "♡"}
                            </button>

                            <button
                              type="button"
                              className="book-button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                background:
                  "#fffaf8",
                border:
                  "1px solid #eadde1",
                borderRadius: "14px",
              }}
            >
              <p style={{ margin: 0 }}>
                No products found.
                Try another search or
                filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Wishlist */}
      <section
        id="wishlist"
        className="section"
        style={{
          background: "#fffaf8",
        }}
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              YOUR FAVOURITES
            </p>

            <h2>
              Your Wishlist ❤️
            </h2>

            <p>
              Save the bouquets and gifts
              you love and come back to
              them anytime.
            </p>
          </div>

          {wishlist.length > 0 ? (
            <div className="bouquet-grid">
              {wishlist.map(
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

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          {product.description ||
                            "Beautifully arranged with care for your special moment."}
                        </p>

                        <div
                          className="card-bottom"
                          style={{
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong>
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="book-button"
                              onClick={() =>
                                addWishlistItemToCart(
                                  product
                                )
                              }
                            >
                              Add to Cart
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleWishlist(
                                  product
                                )
                              }
                              style={{
                                border:
                                  "1px solid #dccbd1",
                                background:
                                  "#fff0f4",
                                color:
                                  "#71384e",
                                borderRadius:
                                  "8px",
                                padding:
                                  "8px 12px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Remove ❤️
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                background:
                  "#ffffff",
                border:
                  "1px solid #eadde1",
                borderRadius: "14px",
                padding: "30px",
              }}
            >
              <p style={{ margin: 0 }}>
                Your wishlist is empty.
                Tap ♡ on a product to
                save it here.
              </p>

              <Link
                href="#bouquets"
                className="primary-button"
                style={{
                  display:
                    "inline-block",
                  marginTop: "16px",
                }}
              >
                Explore Bouquets
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      <section
        id="reviews"
        className="section"
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              CUSTOMER LOVE
            </p>

            <h2>
              What our customers say
            </h2>

            <p>
              Real experiences from
              people who chose Aurivon
              for their special moments.
            </p>
          </div>

          {reviews.length > 0 ? (
            <div
              className="bouquet-grid"
              style={{
                marginBottom: "40px",
              }}
            >
              {reviews.map((review) => (
                <article
                  className="bouquet-card"
                  key={review.id}
                >
                  <div
                    className="bouquet-info"
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {"⭐".repeat(
                        review.rating
                      )}
                    </div>

                    <h3>
                      {review.name}
                    </h3>

                    <p>
                      “{review.comment}”
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                background:
                  "#fffaf8",
                border:
                  "1px solid #eadde1",
                borderRadius: "14px",
                padding: "30px",
                marginBottom:
                  "40px",
              }}
            >
              <p style={{ margin: 0 }}>
                Be the first to share
                your Aurivon experience.
                ⭐
              </p>
            </div>
          )}

          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              background: "#fffaf8",
              border:
                "1px solid #eadde1",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Share your experience
            </h3>

            <p
              style={{
                marginTop: 0,
                color: "#6f5a62",
              }}
            >
              Tell us about your Aurivon
              experience.
            </p>

            <form
              onSubmit={submitReview}
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={reviewName}
                onChange={(event) =>
                  setReviewName(
                    event.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d8c8ce",
                  borderRadius: "8px",
                  fontSize: "15px",
                }}
              />

              <div>
                <p
                  style={{
                    margin:
                      "0 0 8px",
                    fontWeight: 600,
                  }}
                >
                  Your rating
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewRating(
                            star
                          )
                        }
                        aria-label={`Rate ${star} stars`}
                        style={{
                          border: "none",
                          background:
                            "transparent",
                          cursor:
                            "pointer",
                          fontSize:
                            "26px",
                          padding: 0,
                        }}
                      >
                        {star <=
                        reviewRating
                          ? "⭐"
                          : "☆"}
                      </button>
                    )
                  )}
                </div>
              </div>

              <textarea
                placeholder="Write your review..."
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(
                    event.target.value
                  )
                }
                rows={5}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d8c8ce",
                  borderRadius: "8px",
                  fontSize: "15px",
                  resize: "vertical",
                }}
              />

              <button
                type="submit"
                className="book-button"
                disabled={reviewLoading}
                style={{
                  width: "fit-content",
                  padding:
                    "12px 22px",
                  opacity:
                    reviewLoading
                      ? 0.7
                      : 1,
                }}
              >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review ⭐"}
              </button>

              {reviewMessage && (
                <p
                  style={{
                    margin: 0,
                    color: "#71384e",
                    fontWeight: 600,
                  }}
                >
                  {reviewMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
            {/* About */}
      <section
        id="about"
        className="section"
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              ABOUT Aurivon
            </p>

            <h2>
              Flowers made with care
            </h2>

            <p>
              Aurivon is a flower and
              gifting boutique created
              to make beautiful moments
              feel even more special.
            </p>
          </div>

          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <p>
              From elegant bouquets to
              thoughtful gifts, every
              Aurivon order is prepared
              with attention to detail
              and a lot of care.
            </p>

            <p>
              Whether you're celebrating
              a birthday, anniversary,
              wedding, graduation or
              simply want to make
              someone smile, we're here
              to help you find something
              beautiful.
            </p>
          </div>
        </div>
      </section>
      {/* Instagram */}
      <section
        id="instagram"
        className="section"
        style={{
          background: "#fffaf8",
        }}
      >
        <div className="container">
          <div
            className="section-heading"
            style={{
              textAlign: "center",
            }}
          >
            <p className="eyebrow">
              FOLLOW OUR JOURNEY
            </p>

            <h2>
              Aurivon on Instagram 📸
            </h2>

            <p>
              Follow @_aurivon_50 for our
              latest flowers, bouquets,
              gifts and special moments.
            </p>

            <a
              href="https://www.instagram.com/_aurivon_50/"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
              style={{
                display: "inline-block",
                marginTop: "10px",
              }}
            >
              📸 Follow us on Instagram
            </a>
          </div>

          <div
            style={{
              maxWidth: "700px",
              margin: "30px auto 0",
              padding: "30px",
              background: "#ffffff",
              border: "1px solid #eadde1",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
              }}
            >
              📸
            </div>

            <h3>
              @_aurivon_50
            </h3>

            <p
              style={{
                color: "#806c74",
                marginBottom: "20px",
              }}
            >
              See our latest Instagram
              posts and follow Aurivon.
            </p>

            <a
              href="https://www.instagram.com/_aurivon_50/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#71384e",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Open Instagram →
            </a>
          </div>
        </div>
      </section>
      {/* Contact */}
      <section
        id="contact"
        className="section"
        style={{
          background: "#fffaf8",
        }}
      >
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              GET IN TOUCH
            </p>

            <h2>
              We'd love to hear from you
            </h2>

            <p>
              Have a question about a
              bouquet, gift or order?
              Contact us directly.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              💬 WhatsApp Us
            </a>

            <a
              href="tel:+919999999999"
              className="primary-button"
              style={{
                background:
                  "#ffffff",
                color: "#71384e",
                border:
                  "1px solid #dccbd1",
              }}
            >
              📞 Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <h3>Aurivon</h3>

              <p>
                Beautiful flowers.
                Thoughtful moments.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                href="/track"
                className="admin-login-link"
              >
                Track Order
              </Link>

              <Link
                href="#reviews"
                className="admin-login-link"
              >
                ⭐ Reviews
              </Link>

              <Link
                href="#wishlist"
                className="admin-login-link"
              >
                ❤️ Wishlist (
                {wishlist.length})
              </Link>

              <Link
                href="/cart"
                className="admin-login-link"
              >
                🛒 Cart
              </Link>

              <Link
                href="/admin/login"
                className="admin-login-link"
              >
                Admin Login
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop:
                "1px solid #eadde1",
              textAlign: "center",
              fontSize: "14px",
              color: "#806c74",
            }}
          >
            © {new Date().getFullYear()}{" "}
            Aurivon. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}