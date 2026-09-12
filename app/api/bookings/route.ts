import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId")?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: booking.status,
    });
  } catch (error) {
    console.error("Booking tracking failed:", error);

    return NextResponse.json(
      { error: "Unable to find booking." },
      { status: 500 }
    );
  }
}

const allowedStatuses = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

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

    // Name validation
    if (
      !name ||
      name.length < 2 ||
      !/^[A-Za-z\s]+$/.test(name)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid name." },
        { status: 400 }
      );
    }

    // Phone validation
    const phoneDigits = phone.replace(/\D/g, "");

    if (
      !phone ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // Bouquet validation
    if (!bouquet) {
      return NextResponse.json(
        { error: "Please select a bouquet." },
        { status: 400 }
      );
    }

    // Find the selected active product
    const product = await prisma.product.findFirst({
      where: {
        name: bouquet,
        active: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Selected bouquet is no longer available." },
        { status: 400 }
      );
    }

    // Date validation
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

    // Address validation
    if (!address || address.length < 10) {
      return NextResponse.json(
        { error: "Please enter a complete delivery address." },
        { status: 400 }
      );
    }

    // Save booking
    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        bouquet,
        price: product.price,
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation failed:", error);

    return NextResponse.json(
      {
        error: "Unable to save booking. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = String(body.id || "").trim();
    const status = String(body.status || "")
      .trim()
      .toLowerCase();

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status." },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Booking status update failed:", error);

    return NextResponse.json(
      {
        error: "Unable to update booking status.",
      },
      { status: 500 }
    );
  }
}