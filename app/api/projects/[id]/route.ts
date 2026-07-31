import { db } from "@/lib/backend/db";
import { projects } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can update projects" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, image, category, tech, link, githubUrl, isFeatured } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const techArray = Array.isArray(tech)
      ? tech.map((t: string) => t.trim()).filter(Boolean)
      : typeof tech === "string"
      ? tech.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const [updatedProject] = await db
      .update(projects)
      .set({
        title,
        description,
        image: image || null,
        category: category || null,
        tech: techArray,
        link: link || null,
        githubUrl: githubUrl || null,
        isFeatured: Boolean(isFeatured),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = session.user.role as string;
    if (userRole !== "admin" && userRole !== "penulis") {
      return NextResponse.json(
        { error: "Forbidden: Only admin and penulis can delete projects" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (!deletedProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
