import { headers } from "next/headers";
import { auth } from "@/lib/backend/auth";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    // 1. Verify user session for security
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { prompt, options = {} } = body;

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // 3. Initialize GoogleGenAI client
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not defined in environment variables");
      return new Response("AI Service configuration error", { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Map model from request options or default to gemini-3.5-flash
    let model = options.model || "gemini-3.5-flash";
    if (model.includes("gpt-5-nano") || model.includes("gpt-") || model.includes("gemini-2.5-flash-lite") || model.includes("gemini-2.0-flash")) {
      model = "gemini-3.5-flash";
    }

    // 4. Generate stream
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: options.max_tokens ? { maxOutputTokens: options.max_tokens } : undefined,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (e) {
          console.error("Streaming error:", e);
          controller.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in AI Chat Stream API Route:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
