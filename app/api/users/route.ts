import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/backend/db";
import { auth } from "@/lib/backend/auth";
import { comments, posts, users, type UserRole } from "@/schema";

const VALID_ROLES: UserRole[] = ["user", "penulis", "admin"];

function normalizeRoleValue(role: unknown): UserRole {
  if (typeof role === "string") {
    const cleaned = role.trim().toLowerCase();
    if (cleaned === "admin" || cleaned === "penulis" || cleaned === "user") {
      return cleaned;
    }
  }
  return "user";
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = normalizeRoleValue(session.user.role);
    if (currentRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Hanya administrator yang dapat mengakses daftar pengguna" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role")?.trim().toLowerCase() || "";
    const searchParam = searchParams.get("search")?.trim() || "";

    const filters = [];

    if (roleParam && VALID_ROLES.includes(roleParam as UserRole)) {
      filters.push(eq(users.role, roleParam as UserRole));
    }

    if (searchParam) {
      const pattern = `%${searchParam}%`;
      filters.push(or(ilike(users.name, pattern), ilike(users.email, pattern)));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [rows, summaryRows] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          image: users.image,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          postsCount: sql<number>`(
            select count(*)::int from ${posts} where ${posts.authorId} = ${users.id}
          )`,
          commentsCount: sql<number>`(
            select count(*)::int from ${comments} where ${comments.userId} = ${users.id}
          )`,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt)),
      db
        .select({
          total: sql<number>`count(*)::int`,
          regularUsers: sql<number>`count(*) filter (where lower(${users.role}) = 'user')::int`,
          penulisUsers: sql<number>`count(*) filter (where lower(${users.role}) = 'penulis')::int`,
          adminUsers: sql<number>`count(*) filter (where lower(${users.role}) = 'admin')::int`,
        })
        .from(users),
    ]);

    const normalizedUsers = rows.map((row) => ({
      ...row,
      role: normalizeRoleValue(row.role),
      postsCount: Number(row.postsCount || 0),
      commentsCount: Number(row.commentsCount || 0),
    }));

    const summary = summaryRows[0] ?? {
      total: 0,
      regularUsers: 0,
      penulisUsers: 0,
      adminUsers: 0,
    };

    return NextResponse.json({
      users: normalizedUsers,
      summary: {
        total: Number(summary.total || 0),
        regularUsers: Number(summary.regularUsers || 0),
        penulisUsers: Number(summary.penulisUsers || 0),
        adminUsers: Number(summary.adminUsers || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar pengguna" },
      { status: 500 }
    );
  }
}

