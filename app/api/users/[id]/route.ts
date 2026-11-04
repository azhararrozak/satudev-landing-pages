import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/backend/db";
import { auth } from "@/lib/backend/auth";
import { sessions, users, type UserRole } from "@/schema";

type RouteParams = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (normalizeRoleValue(session.user.role) !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Hanya administrator yang dapat mengubah data pengguna" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const [existingUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!existingUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const updates: Partial<{
      name: string;
      role: UserRole;
      emailVerified: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (typeof body.name === "string") {
      const trimmedName = body.name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Nama pengguna tidak boleh kosong" },
          { status: 400 }
        );
      }
      if (trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Nama pengguna maksimal 100 karakter" },
          { status: 400 }
        );
      }
      updates.name = trimmedName;
    }

    if (typeof body.emailVerified === "boolean") {
      updates.emailVerified = body.emailVerified;
    }

    const existingRole = normalizeRoleValue(existingUser.role);
    let roleChanged = false;

    if (body.role !== undefined) {
      const requestedRole =
        typeof body.role === "string" ? (body.role.trim().toLowerCase() as UserRole) : null;

      if (!requestedRole || !VALID_ROLES.includes(requestedRole)) {
        return NextResponse.json(
          { error: "Peran tidak valid. Pilih user, penulis, atau admin." },
          { status: 400 }
        );
      }

      if (id === session.user.id && requestedRole !== "admin") {
        return NextResponse.json(
          {
            error:
              "Anda tidak dapat menurunkan peran akun administrator Anda sendiri yang sedang aktif",
          },
          { status: 400 }
        );
      }

      if (existingRole === "admin" && requestedRole !== "admin") {
        const [adminCountRow] = await db
          .select({
            count: sql<number>`count(*) filter (where lower(${users.role}) = 'admin')::int`,
          })
          .from(users);

        if (Number(adminCountRow?.count || 0) <= 1) {
          return NextResponse.json(
            { error: "Sistem harus memiliki minimal satu akun Administrator" },
            { status: 400 }
          );
        }
      }

      updates.role = requestedRole;
      roleChanged = requestedRole !== existingRole;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    // Revoke target user's active sessions if their role changed so stale cookie caches refresh
    if (roleChanged && id !== session.user.id) {
      await db.delete(sessions).where(eq(sessions.userId, id));
    }

    return NextResponse.json({
      user: {
        ...updatedUser,
        role: normalizeRoleValue(updatedUser.role),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data pengguna" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (normalizeRoleValue(session.user.role) !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Hanya administrator yang dapat menghapus pengguna" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif" },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!existingUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    if (normalizeRoleValue(existingUser.role) === "admin") {
      const [adminCountRow] = await db
        .select({
          count: sql<number>`count(*) filter (where lower(${users.role}) = 'admin')::int`,
        })
        .from(users);

      if (Number(adminCountRow?.count || 0) <= 1) {
        return NextResponse.json(
          { error: "Sistem harus memiliki minimal satu akun Administrator" },
          { status: 400 }
        );
      }
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}

