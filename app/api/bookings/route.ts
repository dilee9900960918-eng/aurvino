import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const bouquet = String(body.bouquet || "").trim();
    const date = String(body.date || "").trim();
    const address = String(body.address || "").trim();
    const message = String(body.message || "").trim();

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

    // Save booking to database
    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        bouquet,
        date: deliveryDate,
        address,
        message: message || null,
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