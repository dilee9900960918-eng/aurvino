import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateDeliveryCharge(address: string) {
  const normalizedAddress = address.toLowerCase();

  // Free delivery inside Bengaluru
  if (
    normalizedAddress.includes("bengaluru") ||
    normalizedAddress.includes("bangalore")
  ) {
    return 0;
  }

  // Standard delivery charge for other locations
  return 100;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const bouquet = String(body.bouquet || "").trim();
    const date = String(body.date || "").trim();
    const address = String(body.address || "").trim();
    const message = String(body.message || "").trim();
    const paymentMethod = String(
      body.paymentMethod || ""
    ).trim();

    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems
      : [];

    if (
      !name ||
      name.length < 2 ||
      !/^[A-Za-z\s]+$/.test(name)
    ) {
      return NextResponse.json(
        {
          error: "Please enter a valid name.",
        },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (
      !phone ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          error:
            "Please select a delivery date.",
        },
        { status: 400 }
      );
    }

    const deliveryDate = new Date(
      `${date}T00:00:00`
    );

    if (
      Number.isNaN(
        deliveryDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid delivery date.",
        },
        { status: 400 }
      );
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (deliveryDate < today) {
      return NextResponse.json(
        {
          error:
            "Delivery date cannot be in the past.",
        },
        { status: 400 }
      );
    }

    if (
      !address ||
      address.length < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a complete delivery address.",
        },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        {
          error:
            "Please select a payment method.",
        },
        { status: 400 }
      );
    }

    let finalBouquet = bouquet;
    let productPrice = 0;

    /*
     * Cart checkout
     */
    if (cartItems.length > 0) {
      const productNames = cartItems
        .map(
          (item: { name?: string }) =>
            String(
              item.name || ""
            ).trim()
        )
        .filter(Boolean);

      if (
        productNames.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "Your cart is empty.",
          },
          { status: 400 }
        );
      }

      const products =
        await prisma.product.findMany({
          where: {
            name: {
              in: productNames,
            },
            active: true,
          },
        });

      if (
        products.length !==
        productNames.length
      ) {
        return NextResponse.json(
          {
            error:
              "One or more products in your cart are no longer available.",
          },
          { status: 400 }
        );
      }

      productPrice =
        products.reduce(
          (total, product) =>
            total + product.price,
          0
        );

      finalBouquet = products
        .map(
          (product) =>
            product.name
        )
        .join(", ");
    } else {
      /*
       * Existing single-product booking
       */
      if (!bouquet) {
        return NextResponse.json(
          {
            error:
              "Please select a bouquet.",
          },
          { status: 400 }
        );
      }

      const product =
        await prisma.product.findFirst({
          where: {
            name: bouquet,
            active: true,
          },
        });

      if (!product) {
        return NextResponse.json(
          {
            error:
              "Selected bouquet is no longer available.",
          },
          { status: 400 }
        );
      }

      productPrice =
        product.price;
    }

    /*
     * Delivery charge
     */
    const deliveryCharge =
      calculateDeliveryCharge(
        address
      );

    /*
     * Final order total
     */
    const finalPrice =
      productPrice +
      deliveryCharge;

    const booking =
      await prisma.booking.create({
        data: {
          name,
          phone,
          bouquet: finalBouquet,
          price: finalPrice,
          date: deliveryDate,
          address,
          message:
            message || null,
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
    console.error(
      "Booking creation failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to save booking. Please try again.",
      },
      { status: 500 }
    );
  }
}