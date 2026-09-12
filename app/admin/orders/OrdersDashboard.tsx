"use client";

import { useState } from "react";

type Booking = {
  id: string;
  name: string;
  phone: string;
  bouquet: string;
  price: number;
  date: Date;
  address: string;
  message: string | null;
  paymentMethod: string;
  status: string;
  createdAt: Date;
};

type Props = {
  bookings: Booking[];
  totalProducts: number;
  totalRevenue: number;
  todaysBookings: number;
};

export default function OrdersDashboard({
  bookings,
  totalProducts,
  totalRevenue,
  todaysBookings,
}: Props) {
  const [orders, setOrders] = useState(bookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    try {
      setUpdatingId(id);

      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? { ...order, status }
            : order
        )
      );
    } catch (error) {
      console.error(error);
      alert("Unable to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="orders-page">
      <section className="orders-container">
        <p className="eyebrow">AURVINO ADMIN</p>

        <h1>Admin Dashboard</h1>

        <p className="orders-intro">
          Manage your products and keep track of customer bookings.
        </p>

        {/* DASHBOARD STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "30px",
            marginBottom: "34px",
          }}
        >
          <div style={statCardStyle}>
            <div style={statIconStyle}>🛍️</div>

            <div>
              <p style={statLabelStyle}>ACTIVE PRODUCTS</p>
              <p style={statNumberStyle}>{totalProducts}</p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statIconStyle}>📦</div>

            <div>
              <p style={statLabelStyle}>TOTAL BOOKINGS</p>
              <p style={statNumberStyle}>{orders.length}</p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statIconStyle}>📅</div>

            <div>
              <p style={statLabelStyle}>TODAY'S BOOKINGS</p>
              <p style={statNumberStyle}>{todaysBookings}</p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statIconStyle}>💰</div>

            <div>
              <p style={statLabelStyle}>TOTAL REVENUE</p>

              <p style={statNumberStyle}>
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "38px",
          }}
        >
          <a
            href="/admin/products"
            style={buttonStyle}
          >
            ✿ Manage Products
          </a>
        </div>

        {/* BOOKINGS */}
        <div
          style={{
            marginBottom: "26px",
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
            CUSTOMER ORDERS
          </p>

          <h2
            style={{
              margin: "7px 0 5px",
              fontFamily:
                "Georgia, 'Times New Roman', serif",
              fontSize: "38px",
              fontWeight: 500,
              color: "#4d2939",
            }}
          >
            Booking Orders
          </h2>

          <p
            style={{
              margin: 0,
              color: "#76666b",
            }}
          >
            View and manage all bouquet bookings received from customers.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <h2>No bookings yet</h2>

            <p>
              Customer bookings will appear here once someone places an order.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((booking) => (
              <article
                className="order-card"
                key={booking.id}
              >
                <div className="order-header">
                  <div>
                    <p className="order-label">
                      BOOKING ID
                    </p>

                    <p className="order-id">
                      {booking.id}
                    </p>
                  </div>

                  <div className="order-date">
                    {new Date(
                      booking.createdAt
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail">
                    <span>Customer</span>

                    <strong>
                      {booking.name}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span>Phone</span>

                    <strong>
                      {booking.phone}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span>Bouquet</span>

                    <strong>
                      {booking.bouquet}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span>Price</span>

                    <strong>
                      ₹{booking.price.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span>Delivery Date</span>

                    <strong>
                      {new Date(
                        booking.date
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span>Payment</span>

                    <strong>
                      {booking.paymentMethod || "COD"}
                    </strong>
                  </div>

                  {/* STATUS */}
                  <div className="order-detail">
                    <span>Status</span>

                    <select
                      value={booking.status}
                      disabled={updatingId === booking.id}
                      onChange={(event) =>
                        updateStatus(
                          booking.id,
                          event.target.value
                        )
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #dccbd1",
                        background: "#ffffff",
                        color: "#4d2939",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor:
                          updatingId === booking.id
                            ? "wait"
                            : "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div className="order-detail order-full">
                    <span>
                      Delivery Address
                    </span>

                    <strong>
                      {booking.address}
                    </strong>
                  </div>

                  {booking.message && (
                    <div className="order-detail order-full">
                      <span>
                        Customer Message
                      </span>

                      <strong>
                        {booking.message}
                      </strong>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const statCardStyle = {
  background: "rgba(255,255,255,0.95)",
  border: "1px solid #eadde1",
  borderRadius: "20px",
  padding: "22px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  boxShadow:
    "0 10px 30px rgba(78,43,55,0.07)",
};

const statIconStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  background: "#f6e6ec",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  flexShrink: 0,
};

const statLabelStyle = {
  margin: 0,
  color: "#8b747d",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "1.5px",
};

const statNumberStyle = {
  margin: "5px 0 0",
  color: "#4d2939",
  fontSize: "30px",
  fontWeight: 700,
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "14px 24px",
  borderRadius: "999px",
  background: "#71384e",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "15px",
  boxShadow:
    "0 8px 20px rgba(113,56,78,0.18)",
  cursor: "pointer",
};