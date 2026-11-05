import { headers } from "next/headers";
import { auth } from "@/lib/backend/auth";
import type OpenAI from "openai";
import {
  buildChatMessages,
  getReasoningParams,
  getSumoPodClient,
  resolveSumoPodModel,
  SumoPodConfigError,
} from "@/lib/ai/sumopod";

export async function POST(request: Request) {
  try {
    // 1. Verify user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
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
      return new Response("Prompt is required", { status: 400 });
    }

    // 3. Initialize SumoPod OpenAI-compatible client & resolve GLM Flash model
    const openai = getSumoPodClient();
    const model = await resolveSumoPodModel(openai, options.model);
    const messages = buildChatMessages(prompt, options.systemPrompt);

    // 4. Create streaming chat completion
    const completionStream = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: options.max_tokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      stream: true,
      ...getReasoningParams(),
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completionStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (streamError) {
          console.error("SumoPod AI streaming error:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in SumoPod AI Chat Stream API Route:", error);

    if (error instanceof SumoPodConfigError) {
      return new Response(error.message, { status: 503 });
    }

    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
