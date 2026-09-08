"use client";

import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";

const bouquetPrices: Record<string, number> = {
  "Rose Elegance": 1499,
  "Pastel Dream": 1799,
  Sunshine: 1299,
};

const bouquetImages: Record<string, string> = {
  "Rose Elegance": "/images/rose-elegance.jpg",
  "Pastel Dream": "/images/rose-bouquete.png",
  Sunshine: "/images/gift-collection.png",
};

const UPI_ID = "9900960918@ybl";

export default function BookingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBouquet, setSelectedBouquet] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const bouquet = String(formData.get("bouquet") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name = "Name must contain at least 2 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Please enter a valid name.";
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (!phone) {
      newErrors.phone = "Please enter your phone number.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!bouquet) {
      newErrors.bouquet = "Please select a bouquet.";
    }

    if (!date) {
      newErrors.date = "Please select a delivery date.";
    } else {
      const selectedDate = new Date(date);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Delivery date cannot be in the past.";
      }
    }

    if (!address) {
      newErrors.address = "Please enter your delivery address.";
    } else if (address.length < 10) {
      newErrors.address =
        "Please enter a more complete delivery address.";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const price = bouquetPrices[bouquet];

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
          ? `UPI Payment - ₹${price}`
          : "Cash on Delivery";

      const imageUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${bouquetImages[bouquet]}`
          : bouquetImages[bouquet];

      const whatsappMessage = `Hello Aurvino,

I have placed a bouquet booking.

Name: ${name}
Phone: ${phone}
Bouquet: ${bouquet}
Price: ₹${price}
Delivery Date: ${date}
Delivery Address: ${address}
Payment Method: ${paymentText}
Message: ${message || "None"}

Bouquet Image:
${imageUrl}

Please confirm my order. Thank you! 🌸`;

      const whatsappUrl = `https://wa.me/919380507626?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      window.open(whatsappUrl, "_blank");

      setSubmitted(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Unable to save booking. Please try again.");
    }
  }

  return (
    <main className="booking-page">
      {submitted ? (
        <div className="success-message">
          <p className="eyebrow">ORDER CONFIRMED</p>

          <h1>Thank you! 🌸</h1>

          <p>
            Your bouquet booking has been received successfully.
          </p>

          <p>
            Your booking details have been prepared for WhatsApp.
            Please press Send to notify Aurvino.
          </p>
        </div>
      ) : (
        <section className="booking-card">
          <p className="eyebrow">PLACE YOUR ORDER</p>

          <h1>Book Your Bouquet</h1>

          <p className="booking-intro">
            Fill in your details and we'll prepare your bouquet with care.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
              />

              {errors.name && (
                <p className="error-message">{errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
              />

              {errors.phone && (
                <p className="error-message">{errors.phone}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bouquet">Bouquet</label>

              <select
                id="bouquet"
                name="bouquet"
                value={selectedBouquet}
                onChange={(e) => {
                  setSelectedBouquet(e.target.value);

                  setErrors((current) => ({
                    ...current,
                    bouquet: "",
                  }));
                }}
              >
                <option value="" disabled>
                  Select a bouquet
                </option>

                <option value="Rose Elegance">
                  Rose Elegance — ₹1,499
                </option>

                <option value="Pastel Dream">
                  Pastel Dream — ₹1,799
                </option>

                <option value="Sunshine">
                  Sunshine — ₹1,299
                </option>
              </select>

              {errors.bouquet && (
                <p className="error-message">
                  {errors.bouquet}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">Delivery Date</label>

              <input
                id="date"
                name="date"
                type="date"
              />

              {errors.date && (
                <p className="error-message">{errors.date}</p>
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
              <h2>Choose Payment Method</h2>

              <div className="payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod === "pay-now"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() => setPaymentMethod("pay-now")}
                >
                  <strong>Pay Now</strong>
                  <span>Pay exact amount using UPI QR</span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "cod"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() => setPaymentMethod("cod")}
                >
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order is delivered</span>
                </button>
              </div>

              {errors.paymentMethod && (
                <p className="error-message">
                  {errors.paymentMethod}
                </p>
              )}

              {paymentMethod === "pay-now" && (
                <UPIPayment bouquet={selectedBouquet} />
              )}
            </div>

            <button type="submit">
              Confirm Booking
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function UPIPayment({ bouquet }: { bouquet: string }) {
  const [qrCode, setQrCode] = useState("");

  const price = bouquetPrices[bouquet] || 0;

  const upiLink =
    price > 0
      ? `upi://pay?pa=${encodeURIComponent(
          UPI_ID
        )}&pn=${encodeURIComponent(
          "Aurvino"
        )}&am=${price.toFixed(
          2
        )}&cu=INR&tn=${encodeURIComponent(
          `Aurvino ${bouquet}`
        )}`
      : "";

  useEffect(() => {
    if (!upiLink) {
      setQrCode("");
      return;
    }

    QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
    })
      .then((url) => {
        setQrCode(url);
      })
      .catch((error) => {
        console.error("QR generation error:", error);
        setQrCode("");
      });
  }, [upiLink]);

  return (
    <div className="qr-payment">
      <h3>UPI Payment</h3>

      {!bouquet ? (
        <p>
          Please select a bouquet above to generate the
          exact-price QR code.
        </p>
      ) : (
        <>
          <p>
            Your payment amount is automatically set for the
            selected bouquet.
          </p>

          <p className="payment-note">
            UPI ID: <strong>{UPI_ID}</strong>
          </p>

          <div className="payment-amount">
            Amount:{" "}
            <strong>
              ₹{price.toLocaleString("en-IN")}
            </strong>
          </div>

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
            Scan this QR with any UPI app. The amount will be
            pre-filled as ₹{price.toLocaleString("en-IN")}.
          </p>
        </>
      )}
    </div>
  );
}