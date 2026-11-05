import path from "path";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile } from "fs/promises";
import { sql } from "@/lib/backend/db";

let isTableInitialized = false;

/**
 * Ensures the `media_uploads` table exists in the PostgreSQL database.
 * This runs automatically so no manual database migration is required.
 */
export async function ensureMediaTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS media_uploads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    isTableInitialized = true;
  } catch (error) {
    console.error("Failed to ensure media_uploads table in database:", error);
    // Don't crash immediately; let callers handle or retry
  }
}

export interface SaveMediaParams {
  id: string; // unique filename, e.g. 1793851009389-flux-1793851007666.jpg
  name: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export interface MediaUploadRecord {
  id: string;
  name: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

/**
 * Saves an uploaded file to PostgreSQL (for Vercel serverless persistence)
 * and safely caches to local disk / /tmp if the filesystem permits.
 */
export async function saveMediaUpload({
  id,
  name,
  mimeType,
  buffer,
  size,
}: SaveMediaParams): Promise<void> {
  // 1. Try saving to public/featuredImageBlog if filesystem is writable (local dev)
  try {
    const uploadDir = path.join(process.cwd(), "public", "featuredImageBlog");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    await writeFile(path.join(uploadDir, id), buffer);
  } catch {
    // Expected on Vercel (EROFS: read-only file system)
    // Silently continue to database persistence
  }

  // 2. Try saving to /tmp/featuredImageBlog for fast warm-lambda cache
  try {
    const tmpDir = path.join("/tmp", "featuredImageBlog");
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }
    await writeFile(path.join(tmpDir, id), buffer);
  } catch {
    // Ignore /tmp write errors
  }

  // 3. Persist to PostgreSQL database (survives all serverless cold starts & redeployments)
  await ensureMediaTable();

  const base64Data = buffer.toString("base64");

  await sql`
    INSERT INTO media_uploads (id, name, mime_type, data, size)
    VALUES (${id}, ${name}, ${mimeType}, ${base64Data}, ${size})
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data,
        mime_type = EXCLUDED.mime_type,
        size = EXCLUDED.size;
  `;
}

/**
 * Retrieves an uploaded file by ID / filename.
 * Checks local filesystem (public & /tmp) first, then queries PostgreSQL.
 */
export async function getMediaUpload(
  id: string
): Promise<MediaUploadRecord | null> {
  // 1. Check public folder (fastest in local dev)
  try {
    const publicPath = path.join(process.cwd(), "public", "featuredImageBlog", id);
    if (existsSync(publicPath)) {
      const buffer = await readFile(publicPath);
      const ext = path.extname(id).toLowerCase();
      const mimeType = extToMime(ext);
      return { id, name: id, mimeType, buffer, size: buffer.length };
    }
  } catch {
    // Ignore error and fall through
  }

  // 2. Check /tmp cache (warm lambda)
  try {
    const tmpPath = path.join("/tmp", "featuredImageBlog", id);
    if (existsSync(tmpPath)) {
      const buffer = await readFile(tmpPath);
      const ext = path.extname(id).toLowerCase();
      const mimeType = extToMime(ext);
      return { id, name: id, mimeType, buffer, size: buffer.length };
    }
  } catch {
    // Ignore error and fall through
  }

  // 3. Query PostgreSQL database
  try {
    await ensureMediaTable();
    const rows = await sql`
      SELECT id, name, mime_type, data, size
      FROM media_uploads
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0] as {
      id: string;
      name: string;
      mime_type: string;
      data: string;
      size: number;
    };

    const buffer = Buffer.from(row.data, "base64");

    // Cache to /tmp for subsequent reads on this lambda
    try {
      const tmpDir = path.join("/tmp", "featuredImageBlog");
      if (!existsSync(tmpDir)) {
        await mkdir(tmpDir, { recursive: true });
      }
      await writeFile(path.join(tmpDir, id), buffer);
    } catch {
      // Ignore
    }

    return {
      id: row.id,
      name: row.name,
      mimeType: row.mime_type,
      buffer,
      size: row.size,
    };
  } catch (dbError) {
    console.error("Failed to fetch media from database:", dbError);
    return null;
  }
}

function extToMime(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
