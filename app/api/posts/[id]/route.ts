import { db } from "@/lib/backend/db";
import { posts, categories } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        featuredImage: posts.featuredImage,
        status: posts.status,
        isPublished: posts.isPublished,
        publishedAt: posts.publishedAt,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.id, id));

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin and penulis can update posts
    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can update posts" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, featuredImage, status, categoryId } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Update published timestamp when changing to published
    const isPublished = status === "published";
    
    // Get current post to check if we need to set publishedAt
    const [currentPost] = await db
      .select({ publishedAt: posts.publishedAt })
      .from(posts)
      .where(eq(posts.id, id));

    const publishedAt = isPublished 
      ? (currentPost?.publishedAt || new Date())
      : null;

    const [updatedPost] = await db
      .update(posts)
      .set({
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status: status || "draft",
        isPublished,
        publishedAt,
        categoryId: categoryId || null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin and penulis can delete posts
    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can delete posts" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    if (!deletedPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
