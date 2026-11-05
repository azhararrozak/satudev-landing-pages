import { NextRequest, NextResponse } from "next/server";
import { saveMediaUpload, getMediaUpload } from "@/lib/backend/media-storage";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file uploaded or invalid file type" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Only JPEG, PNG, WEBP, and GIF are allowed`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    let originalName = "generated-image.png";

    if (file instanceof File && file.name) {
      originalName = file.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "_");
    }

    const fileName = `${timestamp}-${originalName}`;

    // Persist to database (handles Vercel read-only filesystem EROFS gracefully)
    await saveMediaUpload({
      id: fileName,
      name: originalName,
      mimeType: file.type,
      buffer,
      size: file.size,
    });

    // Return public URL (served via app/featuredImageBlog/[filename]/route.ts)
    const publicUrl = `/featuredImageBlog/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) {
    return new Response("Missing file parameter", { status: 400 });
  }

  const media = await getMediaUpload(file);
  if (!media) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(media.buffer, {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": media.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
