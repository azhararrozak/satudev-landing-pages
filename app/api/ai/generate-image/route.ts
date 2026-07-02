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
    
    // Model for image generation
    const model = "gemini-3.1-flash-image";

    // Determine the closest standard aspect ratio
    let aspectRatio = "1:1";
    if (options.ratio) {
      const { w, h } = options.ratio;
      if (w === h) {
        aspectRatio = "1:1";
      } else if (w > h) {
        if (Math.abs(w / h - 16 / 9) < 0.1) aspectRatio = "16:9";
        else if (Math.abs(w / h - 4 / 3) < 0.1) aspectRatio = "4:3";
      } else {
        if (Math.abs(h / w - 16 / 9) < 0.1) aspectRatio = "9:16";
        else if (Math.abs(h / w - 4 / 3) < 0.1) aspectRatio = "3:4";
      }
    }

    // 4. Generate image using unified generateContent method for gemini-3.1-flash-image
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          imageSize: "1K",
          aspectRatio,
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Data = inlineData?.data;

    if (!base64Data) {
      console.error("No inlineData found in response:", JSON.stringify(response));
      throw new Error("No image data returned from Gemini API");
    }

    // Return the base64-encoded image bytes
    return NextResponse.json({
      imageBytes: base64Data,
    });
  } catch (error) {
    console.error("Error in AI Generate Image API Route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
