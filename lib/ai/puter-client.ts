/**
 * Puter AI Client
 * Wrapper untuk Puter.js AI API
 */

// Type definition for Puter SDK on window object
interface PuterWindow extends Window {
  puter?: {
    ai: {
      chat: (prompt: string, options?: PuterAIOptions) => Promise<string | AsyncIterable<string>>;
    };
  };
}

declare const window: PuterWindow;

interface PuterAIOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  // Note: temperature not supported by most Puter AI models
  // temperature?: number;
}

interface ChatResponse {
  text?: string;
  message?: {
    content: string;
    role: string;
  };
}

class PuterAIClient {
  private isInitialized = false;

  /**
   * Initialize Puter SDK
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load Puter SDK if not already loaded
    if (typeof window !== 'undefined' && !window.puter) {
      await this.loadPuterSDK();
    }
    
    this.isInitialized = true;
  }

  /**
   * Load Puter SDK dynamically
   */
  private loadPuterSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Puter SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Chat with AI
   */
  async chat(
    prompt: string,
    options: PuterAIOptions = {}
  ): Promise<string> {
    await this.initialize();

    const defaultOptions: PuterAIOptions = {
      model: 'gpt-5-nano',
      stream: false,
      ...options,
    };

    try {
      const puter = window.puter;
      
      if (!puter || !puter.ai) {
        throw new Error('Puter AI not available');
      }

      const response = await puter.ai.chat(prompt, defaultOptions) as string | ChatResponse;
      
      // Handle different response formats
      if (typeof response === 'string') {
        return response;
      }
      
      if (response.text) {
        return response.text;
      }
      
      if (response.message?.content) {
        return response.message.content;
      }

      return String(response);
    } catch (error) {
      console.error('Puter AI Error:', error);
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
    options: PuterAIOptions = {}
  ): AsyncGenerator<string> {
    await this.initialize();

    const defaultOptions: PuterAIOptions = {
      model: 'gpt-5-nano',
      stream: true,

      ...options,
    };

    try {
      const puter = window.puter;
      
      if (!puter || !puter.ai) {
        throw new Error('Puter AI not available');
      }

      const response = await puter.ai.chat(prompt, defaultOptions);

      // Check if response is iterable (streaming)
      if (typeof response === 'string') {
        yield response;
        return;
      }

      for await (const part of response as AsyncIterable<string>) {
        yield part;
      }
    } catch (error) {
      console.error('Puter AI Streaming Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to stream content'
      );
    }
  }

  /**
   * Check if Puter is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.puter;
  }
}

// Export singleton instance
export const puterAI = new PuterAIClient();
