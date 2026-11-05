import { getMediaUpload } from "@/lib/backend/media-storage";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ filename: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { filename } = await params;

    if (!filename) {
      return new Response("Filename is required", { status: 400 });
    }

    const decodedFilename = decodeURIComponent(filename);
    const media = await getMediaUpload(decodedFilename);

    if (!media) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(media.buffer, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": media.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving media file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { filename } = await params;
    if (!filename) return new Response(null, { status: 400 });

    const media = await getMediaUpload(decodeURIComponent(filename));
    if (!media) return new Response(null, { status: 404 });

    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": media.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}

