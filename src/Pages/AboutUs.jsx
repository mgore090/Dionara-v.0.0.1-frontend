
import { Link } from "react-router-dom";
import "./AboutUs.css";

function AboutUs() {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <p className="about-eyebrow">WELCOME TO DIANORA</p>

        <h1>
          Your Skin.
          <br />
          Your Glow.
          <br />
          <span>Your Way.</span>
        </h1>

        <p className="about-hero-description">
          Thoughtful skincare essentials for your everyday
          self-care ritual. Discover a simpler way to care for
          your skin with DIANORA.
        </p>

        <Link to="/allProducts" className="about-primary-button">
          EXPLORE OUR PRODUCTS
        </Link>
      </section>

      {/* Brand Introduction */}
      <section className="about-intro">
        <div className="about-intro-label">
          <span>01</span>
          <span>OUR STORY</span>
        </div>

        <div className="about-intro-content">
          <p className="about-section-eyebrow">
            GET TO KNOW US
          </p>

          <h2>
            Skincare that feels
            <br />
            <span>like you.</span>
          </h2>

          <p>
            At DIANORA Skin Care, we believe that caring for your
            skin should feel simple, comfortable, and personal.
            Your everyday skincare routine is more than a habit;
            it is a little time dedicated to yourself.
          </p>

          <p>
            Our goal is to bring skincare essentials into your
            daily routine without making things complicated.
            Whether you are starting your skincare journey or
            refining your existing routine, DIANORA is here to
            help you discover products that fit your lifestyle.
          </p>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="about-philosophy">
        <div className="about-philosophy-heading">
          <p className="about-section-eyebrow">
            THE DIANORA PHILOSOPHY
          </p>

          <h2>
            Less complication.
            <br />
            More care.
          </h2>

          <p>
            We believe everyday skincare should be easy to
            understand and easy to make your own.
          </p>
        </div>

        <div className="about-values-grid">
          <article className="about-value-card">
            <span className="about-value-number">01</span>
            <div className="about-value-icon">✧</div>
            <h3>Everyday Essentials</h3>
            <p>
              Skincare products designed to become a natural
              part of your daily self-care routine.
            </p>
          </article>

          <article className="about-value-card">
            <span className="about-value-number">02</span>
            <div className="about-value-icon">♡</div>
            <h3>Care for Yourself</h3>
            <p>
              Make time for yourself and build a routine that
              feels comfortable, consistent, and personal.
            </p>
          </article>

          <article className="about-value-card">
            <span className="about-value-number">03</span>
            <div className="about-value-icon">❋</div>
            <h3>Simple Choices</h3>
            <p>
              Explore our skincare essentials and choose
              products based on your needs and preferences.
            </p>
          </article>
        </div>
      </section>

      {/* Our Products */}
      <section className="about-products">
        <div className="about-products-content">
          <p className="about-section-eyebrow">
            YOUR DAILY SKINCARE RITUAL
          </p>

          <h2>
            Meet your everyday
            <br />
            skincare essentials.
          </h2>

          <p>
            From moisture-focused care to sun protection,
            discover DIANORA products made to fit into your
            everyday skincare routine.
          </p>

          <Link to="/allProducts" className="about-secondary-button">
            SHOP ALL PRODUCTS <span>→</span>
          </Link>
        </div>

        <div className="about-product-highlights">
          <article className="about-product-highlight">
            <span className="about-highlight-number">01</span>
            <div>
              <h3>Moisture + Suncream</h3>
              <p>
                An everyday skincare essential combining
                moisture-focused care with sun protection.
              </p>
            </div>
          </article>

          <article className="about-product-highlight">
            <span className="about-highlight-number">02</span>
            <div>
              <h3>Moisturizer</h3>
              <p>
                A moisturizing skincare essential for your
                daily skin care routine.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="about-commitment">
        <p className="about-section-eyebrow">
          OUR COMMITMENT
        </p>

        <h2>
          Your routine.
          <br />
          Your confidence.
        </h2>

        <p className="about-commitment-description">
          We aim to make discovering and shopping for skincare
          straightforward. We want you to have clear product
          information so you can make informed choices for
          your own skincare needs.
        </p>

        <div className="about-commitment-points">
          <div>
            <span>01</span>
            <p>Clear product information</p>
          </div>

          <div>
            <span>02</span>
            <p>A simple shopping experience</p>
          </div>

          <div>
            <span>03</span>
            <p>Skincare for your daily routine</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact">
        <p className="about-section-eyebrow">
          LET'S CONNECT
        </p>

        <h2>
          We'd love to hear
          <br />
          <span>from you.</span>
        </h2>

        <p>
          Have a question about our products or need help
          with your order? Get in touch with DIANORA.
        </p>

        <div className="about-contact-links">
          <a href="mailto:dinora@gmail.com">
            dinora@gmail.com
          </a>

          <a href="tel:+917058805659">
            +91 7058805659
          </a>

          <a
            href="https://www.instagram.com/dianora_skincare/"
            target="_blank"
            rel="noreferrer"
          >
            Follow us on Instagram ↗
          </a>
        </div>

        <Link to="/allProducts" className="about-primary-button">
          DISCOVER DIANORA
        </Link>
      </section>
    </main>
  );
}

export default AboutUs;
