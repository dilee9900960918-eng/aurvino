"use client";

import { FormEvent, useState } from "react";

export default function BookingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("");

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
          ? "Pay Now - PhonePe QR"
          : "Cash on Delivery";

      const whatsappMessage = `Hello Aurvino,

I have placed a bouquet booking.

Name: ${name}
Phone: ${phone}
Bouquet: ${bouquet}
Delivery Date: ${date}
Delivery Address: ${address}
Payment Method: ${paymentText}
Message: ${message || "None"}

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

  if (submitted) {
    return (
      <main className="booking-page">
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
      </main>
    );
  }

  return (
    <main className="booking-page">
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
              defaultValue=""
            >
              <option value="" disabled>
                Select a bouquet
              </option>

              <option value="Rose Elegance">
                Rose Elegance
              </option>

              <option value="Pastel Dream">
                Pastel Dream
              </option>

              <option value="Sunshine">
                Sunshine
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
                <span>Pay using PhonePe QR</span>
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
              <div className="qr-payment">
                <h3>PhonePe Payment</h3>

                <p>
                  Scan the QR code below to pay with PhonePe.
                </p>

                <img
                  src="/images/phonepe-qr.png"
                  alt="PhonePe payment QR code"
                  className="payment-qr"
                />

                <p className="payment-note">
                  After completing your payment, click Confirm Booking.
                </p>
              </div>
            )}
          </div>

          <button type="submit">
            Confirm Booking
          </button>
        </form>
      </section>
    </main>
  );
}