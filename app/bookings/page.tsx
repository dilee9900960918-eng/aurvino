"use client";

import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl: string;
  category: string;
  event?: string | null;
};

const UPI_ID = "9900960918@ybl";

export default function BookingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBouquet, setSelectedBouquet] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get("product") || "";

    setSelectedBouquet(productName);

    async function loadProduct() {
      if (!productName) {
        setLoadingProduct(false);
        return;
      }

      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const products: Product[] = await response.json();

        const databaseProduct = products.find(
          (product) =>
            product.name.toLowerCase() ===
            productName.toLowerCase()
        );

        if (databaseProduct) {
          setSelectedProduct(databaseProduct);
        }
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(
      formData.get("name") || ""
    ).trim();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const date = String(
      formData.get("date") || ""
    ).trim();

    const address = String(
      formData.get("address") || ""
    ).trim();

    const message = String(
      formData.get("message") || ""
    ).trim();

    const bouquet = selectedBouquet;

    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Please enter a valid name.";
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (!phone) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      newErrors.phone =
        "Please enter a valid phone number.";
    }

    if (!bouquet || !selectedProduct) {
      newErrors.bouquet =
        "No valid product was selected. Please return to the home page and choose a product.";
    }

    if (!date) {
      newErrors.date =
        "Please select a delivery date.";
    } else {
      const selectedDate = new Date(date);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date =
          "Delivery date cannot be in the past.";
      }
    }

    if (!address) {
      newErrors.address =
        "Please enter your delivery address.";
    } else if (address.length < 10) {
      newErrors.address =
        "Please enter a more complete delivery address.";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod =
        "Please select a payment method.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const price = selectedProduct!.price;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          bouquet,
          date,
          address,
          message,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const paymentText =
        paymentMethod === "pay-now"
          ? `UPI Payment - ₹${price.toLocaleString(
              "en-IN"
            )}`
          : "Cash on Delivery";

      const imageUrl = selectedProduct!.imageUrl;

      const whatsappMessage = `Hello Aurvino,

I have placed a bouquet/gift booking.

Name: ${name}
Phone: ${phone}
Product: ${bouquet}
Price: ₹${price.toLocaleString("en-IN")}
Delivery Date: ${date}
Delivery Address: ${address}
Payment Method: ${paymentText}
Message: ${message || "None"}

Product Image:
${imageUrl}

Please confirm my order. Thank you! 🌸`;

      const whatsappUrl =
        `https://wa.me/919845507955?text=${encodeURIComponent(
          whatsappMessage
        )}`;

      window.open(
        whatsappUrl,
        "_blank"
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      alert(
        "Unable to save booking. Please try again."
      );
    }
  }

  return (
    <main className="booking-page">
      {submitted ? (
        <div className="success-message">
          <p className="eyebrow">
            ORDER CONFIRMED
          </p>

          <h1>Thank you! 🌸</h1>

          <p>
            Your bouquet or gift booking has
            been received successfully.
          </p>

          <p>
            Your booking details have been
            prepared for WhatsApp. Please press
            Send to notify Aurvino.
          </p>
        </div>
      ) : (
        <section className="booking-card">
          <p className="eyebrow">
            PLACE YOUR ORDER
          </p>

          <h1>Complete Your Order</h1>

          <p className="booking-intro">
            Fill in your details and we'll
            prepare your order with care.
          </p>

          {/* Selected Product */}
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f8f5f0",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                opacity: 0.7,
              }}
            >
              Selected Product
            </p>

            <h2
              style={{
                margin: "6px 0 0",
              }}
            >
              {loadingProduct
                ? "Loading product..."
                : selectedBouquet ||
                  "No product selected"}
            </h2>

            {selectedProduct && (
              <>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontWeight: 600,
                  }}
                >
                  ₹
                  {selectedProduct.price.toLocaleString(
                    "en-IN"
                  )}
                </p>

                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  style={{
                    width: "100%",
                    maxWidth: "220px",
                    marginTop: "14px",
                    borderRadius: "12px",
                  }}
                />
              </>
            )}
          </div>

          {errors.bouquet && (
            <p className="error-message">
              {errors.bouquet}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="name">
                Your Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
              />

              {errors.name && (
                <p className="error-message">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
              />

              {errors.phone && (
                <p className="error-message">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Delivery Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
              />

              {errors.date && (
                <p className="error-message">
                  {errors.date}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Delivery Address
              </label>

              <textarea
                id="address"
                name="address"
                placeholder="Enter your delivery address"
                rows={4}
              />

              {errors.address && (
                <p className="error-message">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message (Optional)
              </label>

              <textarea
                id="message"
                name="message"
                placeholder="Add a personal message..."
                rows={4}
              />
            </div>

            <div className="payment-section">
              <h2>
                Choose Payment Method
              </h2>

              <div className="payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod === "pay-now"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod("pay-now")
                  }
                >
                  <strong>
                    Pay Now
                  </strong>

                  <span>
                    Pay exact amount using UPI QR
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "cod"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod("cod")
                  }
                >
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order is delivered
                  </span>
                </button>
              </div>

              {errors.paymentMethod && (
                <p className="error-message">
                  {errors.paymentMethod}
                </p>
              )}

              {paymentMethod ===
                "pay-now" &&
                selectedProduct && (
                  <UPIPayment
                    product={selectedProduct}
                  />
                )}
            </div>

            <button
              type="submit"
              disabled={
                loadingProduct ||
                !selectedProduct
              }
            >
              Confirm Booking
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function UPIPayment({
  product,
}: {
  product: Product;
}) {
  const [qrCode, setQrCode] =
    useState("");

  const price = product.price;

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(
      UPI_ID
    )}&pn=${encodeURIComponent(
      "Aurvino"
    )}&am=${price.toFixed(
      2
    )}&cu=INR&tn=${encodeURIComponent(
      `Aurvino ${product.name}`
    )}`;

  useEffect(() => {
    QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
    })
      .then((url) => {
        setQrCode(url);
      })
      .catch((error) => {
        console.error(
          "QR generation error:",
          error
        );

        setQrCode("");
      });
  }, [upiLink]);

  return (
    <div className="qr-payment">
      <h3>UPI Payment</h3>

      <p>
        Payment amount for your selected
        product:
      </p>

      <div className="payment-amount">
        Amount:{" "}
        <strong>
          ₹{price.toLocaleString("en-IN")}
        </strong>
      </div>

      <p className="payment-note">
        UPI ID:{" "}
        <strong>{UPI_ID}</strong>
      </p>

      {qrCode && (
        <div className="upi-qr-wrapper">
          <img
            src={qrCode}
            alt={`UPI QR code for ₹${price}`}
            className="payment-qr"
          />
        </div>
      )}

      <p className="payment-note">
        Scan this QR with any UPI app. The
        amount will be pre-filled as ₹
        {price.toLocaleString("en-IN")}.
      </p>
    </div>
  );
}