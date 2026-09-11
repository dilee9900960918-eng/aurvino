import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Product fetch error:", error);

    return NextResponse.json(
      { error: "Unable to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const price = Number(body.price);
    const description = String(body.description || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const category = String(body.category || "").trim();
    const event = String(body.event || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid price." },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Product image is required." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Math.round(price),
        description: description || null,
        imageUrl,
        category,
        event: event || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.json(
      { error: "Unable to create product." },
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
    const name = String(body.name || "").trim();
    const price = Number(body.price);
    const description = String(body.description || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const category = String(body.category || "").trim();
    const event = String(body.event || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid price." },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Product image is required." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        price: Math.round(price),
        description: description || null,
        imageUrl,
        category,
        event: event || null,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product update error:", error);

    return NextResponse.json(
      { error: "Unable to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product removed successfully.",
    });
  } catch (error) {
    console.error("Product deletion error:", error);

    return NextResponse.json(
      { error: "Unable to remove product." },
      { status: 500 }
    );
  }
}