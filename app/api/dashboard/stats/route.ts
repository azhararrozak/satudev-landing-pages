import { NextResponse } from "next/server";
import { db } from "@/lib/backend/db";
import { posts, categories, comments, projects, tags, users } from "@/schema";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export async function GET() {
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

    const isAdminUser =
      typeof session.user.role === "string" &&
      session.user.role.trim().toLowerCase() === "admin";

    // Fetch all counts concurrently with conditional aggregation to minimize Neon DB roundtrips
    const [
      postsStatsResult,
      projectsStatsResult,
      totalCommentsResult,
      totalCategoriesResult,
      totalTagsResult,
      usersStatsResult,
    ] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)`,
          published: sql<number>`count(*) filter (where ${posts.status} = 'published')`,
          draft: sql<number>`count(*) filter (where ${posts.status} != 'published')`,
          userPosts: sql<number>`count(*) filter (where ${posts.authorId} = ${session.user.id})`,
        })
        .from(posts),
      db
        .select({
          total: sql<number>`count(*)`,
          featured: sql<number>`count(*) filter (where ${projects.isFeatured} = true)`,
        })
        .from(projects),
      db.select({ count: sql<number>`count(*)` }).from(comments),
      db.select({ count: sql<number>`count(*)` }).from(categories),
      db.select({ count: sql<number>`count(*)` }).from(tags),
      isAdminUser
        ? db
            .select({
              total: sql<number>`count(*)`,
              regularUsers: sql<number>`count(*) filter (where lower(${users.role}) = 'user')`,
              penulisUsers: sql<number>`count(*) filter (where lower(${users.role}) = 'penulis')`,
            })
            .from(users)
        : Promise.resolve([{ total: 0, regularUsers: 0, penulisUsers: 0 }]),
    ]);

    const totalPosts = Number(postsStatsResult[0]?.total || 0);
    const publishedPosts = Number(postsStatsResult[0]?.published || 0);
    const draftPosts = Number(postsStatsResult[0]?.draft || 0);
    const userPosts = Number(postsStatsResult[0]?.userPosts || 0);
    const totalProjects = Number(projectsStatsResult[0]?.total || 0);
    const featuredProjects = Number(projectsStatsResult[0]?.featured || 0);
    const totalComments = Number(totalCommentsResult[0]?.count || 0);
    const totalCategories = Number(totalCategoriesResult[0]?.count || 0);
    const totalTags = Number(totalTagsResult[0]?.count || 0);
    const totalUsers = Number(usersStatsResult[0]?.total || 0);
    const regularUsers = Number(usersStatsResult[0]?.regularUsers || 0);
    const penulisUsers = Number(usersStatsResult[0]?.penulisUsers || 0);

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalProjects,
      featuredProjects,
      totalComments,
      totalCategories,
      totalTags,
      totalUsers,
      regularUsers,
      penulisUsers,
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
