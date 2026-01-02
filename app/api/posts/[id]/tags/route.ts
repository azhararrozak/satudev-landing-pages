import { db } from "@/lib/backend/db";
import { postsToTags, tags } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// Get all tags for a specific post
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const postTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        createdAt: tags.createdAt,
      })
      .from(postsToTags)
      .innerJoin(tags, eq(postsToTags.tagId, tags.id))
      .where(eq(postsToTags.postId, id));

    return NextResponse.json(postTags);
  } catch (error) {
    console.error("Error fetching post tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch post tags" },
      { status: 500 }
    );
  }
}

// Add or update tags for a post
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and penulis can update post tags
    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can update post tags" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: "tagIds must be an array" },
        { status: 400 }
      );
    }

    // Remove all existing tags for this post
    await db.delete(postsToTags).where(eq(postsToTags.postId, id));

    // Add new tags
    if (tagIds.length > 0) {
      const values = tagIds.map((tagId) => ({
        postId: id,
        tagId,
      }));

      await db.insert(postsToTags).values(values);
    }

    // Fetch and return the updated tags
    const updatedTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
      })
      .from(postsToTags)
      .innerJoin(tags, eq(postsToTags.tagId, tags.id))
      .where(eq(postsToTags.postId, id));

    return NextResponse.json(updatedTags);
  } catch (error) {
    console.error("Error updating post tags:", error);
    return NextResponse.json(
      { error: "Failed to update post tags" },
      { status: 500 }
    );
  }
}

// Remove a specific tag from a post
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and penulis can remove post tags
    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can remove post tags" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { error: "tagId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(postsToTags)
      .where(
        eq(postsToTags.postId, id) && eq(postsToTags.tagId, tagId)
      );

    return NextResponse.json({ message: "Tag removed successfully" });
  } catch (error) {
    console.error("Error removing post tag:", error);
    return NextResponse.json(
      { error: "Failed to remove post tag" },
      { status: 500 }
    );
  }
}
