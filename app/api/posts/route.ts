import { db } from "@/lib/backend/db";
import { posts, categories } from "@/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // filter by status
    const sort = searchParams.get("sort") || "desc"; // asc or desc

    const offset = (page - 1) * limit;

    // Build query with filters
    let query = db
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
      .leftJoin(categories, eq(posts.categoryId, categories.id));

    // Apply status filter if provided
    if (status) {
      query = query.where(eq(posts.status, status));
    }

    // Apply sorting
    if (sort === "asc") {
      query = query.orderBy(posts.createdAt);
    } else {
      query = query.orderBy(desc(posts.createdAt));
    }

    // Get total count for pagination
    const allPosts = await query;
    const total = allPosts.length;

    // Apply pagination
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    // Return with pagination metadata
    return NextResponse.json({
      posts: paginatedPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
