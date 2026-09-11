import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="orders-page">
      <section className="orders-container">
        <p className="eyebrow">AURVINO ADMIN</p>

        <h1>Booking Orders</h1>

        <p className="orders-intro">
          View all bouquet bookings received from customers.
        </p>

        <a
          href="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "20px",
            marginBottom: "30px",
            padding: "14px 24px",
            borderRadius: "999px",
            background: "#71384e",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "15px",
            boxShadow: "0 8px 20px rgba(113, 56, 78, 0.18)",
            cursor: "pointer",
          }}
        >
          ✿ Manage Products
        </a>

        {bookings.length === 0 ? (
          <div className="no-orders">
            <h2>No bookings yet</h2>
            <p>
              Customer bookings will appear here once someone places an order.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {bookings.map((booking) => (
              <article className="order-card" key={booking.id}>
                <div className="order-header">
                  <div>
                    <p className="order-label">BOOKING ID</p>
                    <p className="order-id">{booking.id}</p>
                  </div>

                  <div className="order-date">
                    {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail">
                    <span>Customer</span>
                    <strong>{booking.name}</strong>
                  </div>

                  <div className="order-detail">
                    <span>Phone</span>
                    <strong>{booking.phone}</strong>
                  </div>

                  <div className="order-detail">
                    <span>Bouquet</span>
                    <strong>{booking.bouquet}</strong>
                  </div>

                  <div className="order-detail">
                    <span>Delivery Date</span>
                    <strong>
                      {new Date(booking.date).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="order-detail order-full">
                    <span>Delivery Address</span>
                    <strong>{booking.address}</strong>
                  </div>

                  {booking.message && (
                    <div className="order-detail order-full">
                      <span>Customer Message</span>
                      <strong>{booking.message}</strong>
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