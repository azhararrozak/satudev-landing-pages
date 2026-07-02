import { NextResponse } from "next/server";
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { prompt, options = {} } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 3. Initialize GoogleGenAI client
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "AI Service configuration error" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Map model from request options or default to gemini-3.5-flash
    let model = options.model || "gemini-3.5-flash";
    // Map puter models to gemini models if needed
    if (model.includes("gpt-5-nano") || model.includes("gpt-") || model.includes("gemini-2.0-flash")) {
      model = "gemini-3.5-flash";
    }

    // 4. Generate content
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: options.max_tokens ? { maxOutputTokens: options.max_tokens } : undefined,
    });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error) {
    console.error("Error in AI Chat API Route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
