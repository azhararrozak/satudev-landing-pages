import { db } from "@/lib/backend/db";
import { comments } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET single comment
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const comment = await db.select().from(comments).where(eq(comments.id, id));

    if (comment.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment[0]);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// PUT update comment
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));

    if (existingComment.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only allow admin or comment owner to update
    const userRole = session.user.role as string;
    if (
      userRole !== "admin" &&
      existingComment[0].userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own comments" },
        { status: 403 }
      );
    }

    const [updatedComment] = await db
      .update(comments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE comment
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if comment exists
    const existingComment = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));

    if (existingComment.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only allow admin or comment owner to delete
    const userRole = session.user.role as string;
    if (
      userRole !== "admin" &&
      existingComment[0].userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own comments" },
        { status: 403 }
      );
    }

    await db.delete(comments).where(eq(comments.id, id));

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
