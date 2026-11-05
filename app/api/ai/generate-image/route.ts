import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/backend/auth";
import {
  generateFluxImage,
  CloudflareWorkersAIConfigError,
} from "@/lib/ai/cloudflare";

export async function POST(request: Request) {
  try {
    // 1. Verify user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { prompt, options = {} } = body as {
      prompt?: string;
      options?: {
        model?: string;
        steps?: number;
        seed?: number;
        noText?: boolean;
      };
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 3. Generate image using Cloudflare Workers AI (@cf/black-forest-labs/flux-1-schnell)
    const result = await generateFluxImage(prompt, {
      model: options.model,
      steps: options.steps ?? 4,
      seed: options.seed,
      noText: options.noText ?? true,
    });

    return NextResponse.json({
      imageBytes: result.imageBytes,
      mimeType: result.mimeType,
      model: result.model,
    });
  } catch (error) {
    console.error("Error in Cloudflare Workers AI Generate Image API Route:", error);

    if (error instanceof CloudflareWorkersAIConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
