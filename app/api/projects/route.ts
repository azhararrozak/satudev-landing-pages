import { db } from "@/lib/backend/db";
import { projects } from "@/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/backend/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query = db.select().from(projects);

    let result;
    if (category && category !== "all") {
      result = await query.where(eq(projects.category, category)).orderBy(desc(projects.createdAt));
    } else {
      result = await query.orderBy(desc(projects.createdAt));
    }

    return NextResponse.json({
      projects: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
        { error: "Forbidden: Only admin and penulis can create projects" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, image, category, tech, link, githubUrl, isFeatured } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Ensure tech is array of strings
    const techArray = Array.isArray(tech)
      ? tech.map((t: string) => t.trim()).filter(Boolean)
      : typeof tech === "string"
      ? tech.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const [newProject] = await db
      .insert(projects)
      .values({
        title,
        description,
        image: image || null,
        category: category || null,
        tech: techArray,
        link: link || null,
        githubUrl: githubUrl || null,
        isFeatured: Boolean(isFeatured),
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
