"use client";

import { useState } from "react";

const steps = [
  {
    key: "pending",
    label: "Order Placed",
    icon: "📦",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "✓",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "🌸",
  },
];

export default function TrackPage() {
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function trackBooking() {
    if (!bookingId.trim()) {
      setError("Please enter your booking ID.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(
        `/api/bookings?bookingId=${encodeURIComponent(
          bookingId.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Booking not found."
        );
      }

      setStatus(data.status);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to find booking."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentStep =
    status === "pending"
      ? 0
      : status === "confirmed"
      ? 1
      : status === "delivered"
      ? 2
      : -1;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 20px",
        background:
          "linear-gradient(180deg, #fff8fa 0%, #f8eef2 100%)",
      }}
    >
      <section
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "24px",
          boxShadow:
            "0 15px 40px rgba(78,43,55,0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#a34c70",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          AURVINO
        </p>

        <h1
          style={{
            margin: "8px 0",
            color: "#4d2939",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
            fontSize: "42px",
            fontWeight: 500,
          }}
        >
          Track Your Order
        </h1>

        <p
          style={{
            color: "#76666b",
            lineHeight: 1.6,
          }}
        >
          Enter your booking ID to check your order status.
        </p>

        <input
          type="text"
          value={bookingId}
          onChange={(event) =>
            setBookingId(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              trackBooking();
            }
          }}
          placeholder="Enter booking ID"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px 16px",
            marginTop: "20px",
            borderRadius: "12px",
            border: "1px solid #dccbd1",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={trackBooking}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "15px",
            border: "none",
            borderRadius: "999px",
            background: "#71384e",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: loading
              ? "wait"
              : "pointer",
          }}
        >
          {loading ? "Checking..." : "Track Order"}
        </button>

        {error && (
          <p
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#f8e4e4",
              color: "#9a3d3d",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        {status === "cancelled" && (
          <div
            style={{
              marginTop: "28px",
              padding: "26px",
              borderRadius: "18px",
              background: "#f8e4e4",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom: "8px",
              }}
            >
              ✕
            </div>

            <h2
              style={{
                margin: 0,
                color: "#9a3d3d",
                fontSize: "28px",
              }}
            >
              Order Cancelled
            </h2>

            <p
              style={{
                marginBottom: 0,
                color: "#765b5b",
              }}
            >
              This booking has been cancelled.
            </p>
          </div>
        )}

        {status &&
          status !== "cancelled" &&
          currentStep >= 0 && (
            <div
              style={{
                marginTop: "32px",
              }}
            >
              <p
                style={{
                  margin: "0 0 24px",
                  textAlign: "center",
                  color: "#8b747d",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                }}
              >
                ORDER PROGRESS
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "22px",
                    left: "12%",
                    right: "12%",
                    height: "3px",
                    background: "#eadde1",
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "22px",
                    left: "12%",
                    width:
                      currentStep === 0
                        ? "0%"
                        : currentStep === 1
                        ? "38%"
                        : "76%",
                    height: "3px",
                    background: "#71384e",
                    zIndex: 1,
                    transition: "width 0.3s ease",
                  }}
                />

                {steps.map((step, index) => {
                  const completed =
                    index <= currentStep;

                  return (
                    <div
                      key={step.key}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "33.33%",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          margin: "0 auto 10px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: completed
                            ? "#71384e"
                            : "#eadde1",
                          color: completed
                            ? "#ffffff"
                            : "#8b747d",
                          fontSize: "18px",
                          fontWeight: 700,
                          boxShadow: completed
                            ? "0 6px 16px rgba(113,56,78,0.2)"
                            : "none",
                        }}
                      >
                        {step.icon}
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: completed
                            ? "#4d2939"
                            : "#9b8b91",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "18px",
                  borderRadius: "14px",
                  background: "#f8eef2",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    color: "#8b747d",
                    fontSize: "12px",
                  }}
                >
                  CURRENT STATUS
                </span>

                <h2
                  style={{
                    margin: "6px 0 0",
                    color: "#71384e",
                    fontSize: "24px",
                    textTransform: "capitalize",
                  }}
                >
                  {status}
                </h2>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}