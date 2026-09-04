import Link from "next/link";

const bouquets = [
  {
    name: "Rose Elegance",
    price: "₹1,499",
    description: "A timeless arrangement of premium roses.",
    image: "/images/rose-bouquete.png",
  },
  {
    name: "Pastel Dream",
    price: "₹1,799",
    description: "Soft seasonal blooms in a beautiful pastel palette.",
    image: "/images/rose-bouquete.png",
  },
  {
    name: "Sunshine",
    price: "₹1,299",
    description: "Bright flowers designed to make someone's day.",
    image: "/images/rose-bouquete.png",
  },
];

export default function Home() {
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

      {/* Bouquets */}
      <section id="bouquets" className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">OUR COLLECTION</p>

            <h2>Beautiful flowers for every occasion</h2>

            <p>
              Discover our carefully designed bouquets, made fresh for
              your special moments.
            </p>
          </div>

          <div className="bouquet-grid">
            {bouquets.map((bouquet) => (
              <article className="bouquet-card" key={bouquet.name}>
                <div className="bouquet-image">
                  <img
                    src={bouquet.image}
                    alt={bouquet.name}
                    className="bouquet-photo"
                  />
                </div>

                <div className="bouquet-info">
                  <h3>{bouquet.name}</h3>

                  <p>{bouquet.description}</p>

                  <div className="card-bottom">
                    <strong>{bouquet.price}</strong>

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