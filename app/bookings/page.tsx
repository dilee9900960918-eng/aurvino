"use client";

import { FormEvent, useState } from "react";

export default function BookingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Name validation
    if (!name) {
      newErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name = "Name must contain at least 2 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Please enter a valid name.";
    }

    // Phone validation
    const phoneDigits = phone.replace(/\D/g, "");

    if (!phone) {
      newErrors.phone = "Please enter your phone number.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    // Bouquet validation
    if (!bouquet) {
      newErrors.bouquet = "Please select a bouquet.";
    }

    // Date validation
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

    // Address validation
    if (!address) {
      newErrors.address = "Please enter your delivery address.";
    } else if (address.length < 10) {
      newErrors.address =
        "Please enter a more complete delivery address.";
    }

    setErrors(newErrors);

    // Don't submit if there are errors
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Everything is valid — save booking to database
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
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      // Only show success after the database confirms the booking
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
            We will contact you shortly to confirm your delivery.
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
            <h2>Payment</h2>

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

          <button type="submit">
            Confirm Booking
          </button>
        </form>
      </section>
    </main>
  );
}