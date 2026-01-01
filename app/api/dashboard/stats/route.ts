import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/backend/db";
import { posts, categories, comments } from "@/schema";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get session to check auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total posts
    const totalPostsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts);
    const totalPosts = Number(totalPostsResult[0]?.count || 0);

    // Get total comments
    const totalCommentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments);
    const totalComments = Number(totalCommentsResult[0]?.count || 0);

    // Get total categories
    const totalCategoriesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);
    const totalCategories = Number(totalCategoriesResult[0]?.count || 0);

    // Get user's posts if not admin
    let userPosts = 0;
    if (session.user.role !== "admin") {
      const userPostsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(sql`${posts.authorId} = ${session.user.id}`);
      userPosts = Number(userPostsResult[0]?.count || 0);
    }

    return NextResponse.json({
      totalPosts,
      totalComments,
      totalCategories,
      userPosts,
      role: session.user.role,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
