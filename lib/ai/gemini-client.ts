/**
 * Gemini AI Client (Delegates to Server-Side Google Gen AI API)
 * Wrapper untuk backend API route yang berinteraksi dengan Google Gemini SDK
 */

interface GeminiAIOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
}

class GeminiAIClient {
  private isInitialized = false;

  /**
   * Initialize SDK (No-op since we use backend APIs now)
   */
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  /**
   * Chat with AI
   */
  async chat(
    prompt: string,
    options: GeminiAIOptions = {}
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate content'
      );
    }
  }

  /**
   * Chat with streaming
   */
  async *chatStream(
    prompt: string,
    options: GeminiAIOptions = {}
  ): AsyncGenerator<string> {
    try {
      const response = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } catch (error) {
      console.error('AI Streaming Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to stream content'
      );
    }
  }

  /**
   * Check if AI client is available (Always true since it uses server API)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Generate image from text using backend Google Gen AI
   */
  async generateImage(
    prompt: string,
    options: {
      provider?: string;
      model?: string;
      width?: number;
      height?: number;
      quality?: string;
      ratio?: { w: number; h: number };
    } = {}
  ): Promise<Blob> {
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.imageBytes) {
        throw new Error('No image bytes returned from API');
      }

      // Convert base64 image bytes to Blob
      const binaryString = window.atob(data.imageBytes);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: 'image/jpeg' });
    } catch (error) {
      console.error('AI Image Generation Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    }
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIClient();

// Backwards compatibility alias for components/hooks importing puterAI
export const puterAI = geminiAI;
