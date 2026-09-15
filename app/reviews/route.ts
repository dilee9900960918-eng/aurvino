import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET REVIEWS
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Review loading error:", error);

    return NextResponse.json(
      {
        error: "Unable to load reviews",
      },
      {
        status: 500,
      }
    );
  }
}

// SAVE REVIEW
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const rating = Number(body.rating || 0);
    const comment = String(body.comment || "").trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "Please enter your name",
        },
        {
          status: 400,
        }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: "Please select a rating",
        },
        {
          status: 400,
        }
      );
    }

    if (comment.length < 5) {
      return NextResponse.json(
        {
          error: "Please enter a review",
        },
        {
          status: 400,
        }
      );
    }

    const review = await prisma.review.create({
      data: {
        name,
        rating,
        comment,
        approved: false,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Review save error:", error);

    return NextResponse.json(
      {
        error: "Unable to save review",
      },
      {
        status: 500,
      }
    );
  }
}