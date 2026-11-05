import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/backend/auth";
import type OpenAI from "openai";
import {
  buildChatMessages,
  getReasoningParams,
  stripCodeFences,
  getSumoPodClient,
  resolveSumoPodModel,
  SumoPodConfigError,
} from "@/lib/ai/sumopod";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
        systemPrompt?: string;
        max_tokens?: number;
        temperature?: number;
      };
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 3. Initialize SumoPod OpenAI-compatible client & resolve GLM Flash model
    const openai = getSumoPodClient();
    const model = await resolveSumoPodModel(openai, options.model);
    const messages = buildChatMessages(prompt, options.systemPrompt);

    // 4. Request chat completion from SumoPod AI
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: options.max_tokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      ...getReasoningParams(),
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);

    const choice = response.choices[0];
    const text = stripCodeFences(choice?.message?.content ?? "");

    if (!text) {
      console.error("SumoPod AI returned empty content", {
        model: response.model || model,
        finishReason: choice?.finish_reason,
        usage: response.usage,
      });
      return NextResponse.json(
        {
          error:
            choice?.finish_reason === "length"
              ? "AI kehabisan batas token sebelum menulis jawaban. Coba pilih panjang artikel yang lebih pendek."
              : "AI tidak mengembalikan konten. Silakan coba lagi.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      text,
      model: response.model || model,
    });
  } catch (error) {
    console.error("Error in SumoPod AI Chat API Route:", error);

    if (error instanceof SumoPodConfigError) {
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
