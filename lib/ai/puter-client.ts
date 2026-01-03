/**
 * Puter AI Client
 * Wrapper untuk Puter.js AI API
 */

// Type definition for Puter SDK on window object
interface PuterWindow extends Window {
  puter?: {
    ai: {
      chat: (prompt: string, options?: PuterAIOptions) => Promise<string | AsyncIterable<string>>;
      txt2img: (prompt: string, options?: {
        provider?: string;
        model?: string;
        quality?: string;
        ratio?: { w: number; h: number };
        width?: number;
        height?: number;
      }) => Promise<HTMLImageElement | Blob>;
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

  /**
   * Generate image from text using Puter AI txt2img
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
    await this.initialize();

    // Default to OpenAI provider with gpt-image-1-mini
    const defaultOptions = {
      provider: 'openai-image-generation',
      model: 'gpt-image-1-mini',
      quality: 'low',
      ratio: { w: 1024, h: 1024 },
      ...options,
    };

    console.log('generateImage called with:', { prompt, options: defaultOptions });

    try {
      const puter = window.puter;
      
      if (!puter || !puter.ai) {
        throw new Error('Puter AI not available');
      }

      console.log('Calling puter.ai.txt2img...');

      // Call txt2img API
      const response = await puter.ai.txt2img(prompt, defaultOptions);

      console.log('txt2img response received:', {
        type: typeof response,
        isBlob: response instanceof Blob,
        isHTMLImageElement: response instanceof HTMLImageElement,
        size: response instanceof Blob ? response.size : 'N/A'
      });

      // Response can be HTMLImageElement or Blob
      if (response instanceof HTMLImageElement) {
        // Convert image element to Blob
        console.log('Converting HTMLImageElement to Blob...');
        return await this.imageElementToBlob(response);
      }

      if (response instanceof Blob) {
        if (response.size === 0) {
          throw new Error('Generated image is empty (0 bytes)');
        }
        return response;
      }

      console.error('Invalid response type:', response);
      throw new Error('Invalid response format from txt2img');
    } catch (error) {
      console.error('Puter AI Image Generation Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    }
  }

  /**
   * Convert HTMLImageElement to Blob
   */
  private async imageElementToBlob(image: HTMLImageElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Wait for image to load if not loaded
      if (!image.complete) {
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to blob'));
            }
          }, 'image/png');
        };
        image.onerror = () => reject(new Error('Image failed to load'));
      } else {
        ctx.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/png');
      }
    });
  }
}

// Export singleton instance
export const puterAI = new PuterAIClient();
