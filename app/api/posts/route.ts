import { db } from "@/lib/backend/db";
import { posts, categories } from "@/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
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
      .orderBy(desc(posts.createdAt));

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Only admin and penulis can create posts
    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can create posts" },
        { status: 403 }
      );
    }

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

    // Set published timestamp if status is published
    const isPublished = status === "published";
    const publishedAt = isPublished ? new Date() : null;

    const [newPost] = await db
      .insert(posts)
      .values({
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status: status || "draft",
        isPublished,
        publishedAt,
        categoryId: categoryId || null,
        authorId: session.user.id,
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
