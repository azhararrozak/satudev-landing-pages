import { db } from "@/lib/backend/db";
import { comments, posts } from "@/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

// GET all comments or filter by postId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const includeReplies = searchParams.get("includeReplies") !== "false";

    let query = db
      .select({
        id: comments.id,
        content: comments.content,
        authorName: comments.authorName,
        authorEmail: comments.authorEmail,
        postId: comments.postId,
        postTitle: posts.title,
        postSlug: posts.slug,
        parentId: comments.parentId,
        userId: comments.userId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .leftJoin(posts, eq(comments.postId, posts.id));

    // Filter by postId if provided
    if (postId) {
      if (includeReplies) {
        query = query.where(eq(comments.postId, postId));
      } else {
        query = query.where(
          and(eq(comments.postId, postId), isNull(comments.parentId))
        );
      }
    } else {
      // If no postId, only return top-level comments
      query = query.where(isNull(comments.parentId));
    }

    const allComments = await query.orderBy(desc(comments.createdAt));

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST create new comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, authorName, authorEmail, postId, parentId } = body;

    if (!content || !authorName || !authorEmail || !postId) {
      return NextResponse.json(
        { error: "Content, authorName, authorEmail, and postId are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.select().from(posts).where(eq(posts.id, postId));
    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if authenticated user
    let userId = null;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user) {
        userId = session.user.id;
      }
    } catch (error) {
      // Not authenticated, continue as guest
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        content,
        authorName,
        authorEmail,
        postId,
        parentId: parentId || null,
        userId,
      })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
