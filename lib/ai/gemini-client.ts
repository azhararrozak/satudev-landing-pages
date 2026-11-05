/**
 * SumoPod AI Client (Delegates to Server-Side SumoPod OpenAI-Compatible API Routes)
 * Wrapper untuk endpoint internal `/api/ai/*` yang terhubung ke SumoPod AI (GLM Flash)
 */

export interface AIChatOptions {
  model?: string;
  systemPrompt?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

class SumoPodAIClient {
  private isInitialized = false;

  /**
   * Initialize client (No-op karena autentikasi API dilakukan di server)
   */
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  /**
   * Chat completion non-streaming via `/api/ai/chat`
   */
  async chat(prompt: string, options: AIChatOptions = {}): Promise<string> {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("SumoPod AI Chat Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate content"
      );
    }
  }

  /**
   * Chat completion streaming via `/api/ai/chat-stream`
   */
  async *chatStream(
    prompt: string,
    options: AIChatOptions = {}
  ): AsyncGenerator<string> {
    try {
      const response = await fetch("/api/ai/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          yield chunk;
        }
      }

      const trailing = decoder.decode();
      if (trailing) {
        yield trailing;
      }
    } catch (error) {
      console.error("SumoPod AI Streaming Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to stream content"
      );
    }
  }

  /**
   * Check if AI client is available
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Generate image via `/api/ai/generate-image`
   */
  async generateImage(
    prompt: string,
    options: {
      provider?: string;
      model?: string;
      steps?: number;
      seed?: number;
      noText?: boolean;
      width?: number;
      height?: number;
      quality?: string;
      ratio?: { w: number; h: number };
    } = {}
  ): Promise<Blob> {
    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (!data.imageBytes) {
        throw new Error("No image bytes returned from API");
      }

      const binaryString = window.atob(data.imageBytes);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const mimeType = data.mimeType || "image/jpeg";
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      console.error("AI Image Generation Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    }
  }
}

export const sumoPodAI = new SumoPodAIClient();

// Backwards-compatible exports for existing imports across the project
export const geminiAI = sumoPodAI;
export const puterAI = sumoPodAI;
