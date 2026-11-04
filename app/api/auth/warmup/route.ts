import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/backend/db";

let lastWarmupAt = 0;
const WARMUP_COOLDOWN_MS = 60_000;

export async function GET() {
  const now = Date.now();
  if (now - lastWarmupAt < WARMUP_COOLDOWN_MS) {
    return NextResponse.json({ ok: true, cached: true });
  }

  lastWarmupAt = now;
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ ok: true, cached: false });
  } catch {
    lastWarmupAt = 0;
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

