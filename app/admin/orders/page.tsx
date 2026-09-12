import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrdersDashboard from "./OrdersDashboard";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [bookings, totalProducts] = await Promise.all([
    prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.product.count({
      where: {
        active: true,
      },
    }),
  ]);

  const totalBookings = bookings.length;

  const totalRevenue = bookings.reduce(
    (total, booking) => total + booking.price,
    0
  );

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const todaysBookings = bookings.filter(
    (booking) =>
      new Date(booking.createdAt) >= startOfToday
  ).length;

  return (
    <OrdersDashboard
      bookings={bookings}
      totalProducts={totalProducts}
      totalRevenue={totalRevenue}
      todaysBookings={todaysBookings}
    />
  );
}