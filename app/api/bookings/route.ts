import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateDeliveryCharge(address: string) {
  const normalizedAddress = address.toLowerCase();

  if (
    normalizedAddress.includes("bengaluru") ||
    normalizedAddress.includes("bangalore")
  ) {
    return 0;
  }

  return 100;
}

// GET: Fetch all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Booking loading failed:", error);
    return NextResponse.json(
      { error: "Unable to load bookings." },
      { status: 500 }
    );
  }
}

// POST: Create a booking
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const bouquet = String(body.bouquet || "").trim();
    const date = String(body.date || "").trim();
    const address = String(body.address || "").trim();
    const message = String(body.message || "").trim();
    const paymentMethod = String(body.paymentMethod || "").trim();
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];

    if (!name || name.length < 2 || !/^[A-Za-z\s]+$/.test(name)) {
      return NextResponse.json(
        { error: "Please enter a valid name." },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Please select a delivery date." },
        { status: 400 }
      );
    }

    const deliveryDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(deliveryDate.getTime())) {
      return NextResponse.json(
        { error: "Please enter a valid delivery date." },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deliveryDate < today) {
      return NextResponse.json(
        { error: "Delivery date cannot be in the past." },
        { status: 400 }
      );
    }

    if (!address || address.length < 10) {
      return NextResponse.json(
        { error: "Please enter a complete delivery address." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Please select a payment method." },
        { status: 400 }
      );
    }

    let finalBouquet = bouquet;
    let productPrice = 0;

    if (cartItems.length > 0) {
      const productNames = cartItems
        .map((item: { name?: string }) => String(item.name || "").trim())
        .filter(Boolean);

      if (productNames.length === 0) {
        return NextResponse.json(
          { error: "Your cart is empty." },
          { status: 400 }
        );
      }

      const products = await prisma.product.findMany({
        where: {
          name: { in: productNames },
          active: true,
        },
      });

      if (products.length !== productNames.length) {
        return NextResponse.json(
          { error: "One or more products in your cart are no longer available." },
          { status: 400 }
        );
      }

      productPrice = products.reduce(
        (total, product) => total + product.price,
        0
      );

      finalBouquet = products.map((product) => product.name).join(", ");
    } else {
      if (!bouquet) {
        return NextResponse.json(
          { error: "Please select a bouquet." },
          { status: 400 }
        );
      }

      const product = await prisma.product.findFirst({
        where: { name: bouquet, active: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Selected bouquet is no longer available." },
          { status: 400 }
        );
      }

      productPrice = product.price;
      finalBouquet = product.name;
    }

    const deliveryCharge = calculateDeliveryCharge(address);
    const finalPrice = productPrice + deliveryCharge;

    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        bouquet: finalBouquet,
        price: finalPrice,
        date: deliveryDate,
        address,
        message: message || null,
        paymentMethod,
      },
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        productPrice,
        deliveryCharge,
        price: finalPrice,
        bouquet: finalBouquet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Unable to save booking. Please try again." },
      { status: 500 }
    );
  }
}

// PUT: Update booking status from the admin dashboard
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // The dashboard sends { id, status }
    const bookingId = String(body.id || body.bookingId || "").trim();
    const status = String(body.status || "").trim().toLowerCase();

    const allowedStatuses = [
      "pending",
      "confirmed",
      "delivered",
      "cancelled",
    ];

    if (!bookingId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking ID or status." },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking status update failed:", error);
    return NextResponse.json(
      { error: "Unable to update booking status." },
      { status: 500 }
    );
  }
}