/**
 * Blog Article Generator
 * Main service untuk generate artikel menggunakan Puter AI
 */

import { puterAI } from './puter-client';
import {
  generateFullArticlePrompt,
  generateTitlePrompt,
  generateExcerptPrompt,
  generateImprovePrompt,
  generateExpandPrompt,
  getSystemPrompt,
  type BlogPromptParams,
} from './prompts/blog-prompts';

export interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
}

export interface GenerationOptions extends BlogPromptParams {
  model?: string;
  useStreaming?: boolean;
}

/**
 * Generate artikel blog lengkap
 */
export async function generateBlogArticle(
  options: GenerationOptions
): Promise<GeneratedArticle> {
  const { topic, language = 'id', model = 'gpt-5-nano', ...promptParams } = options;

  if (!topic) {
    throw new Error('Topic is required for article generation');
  }

  try {
    // Generate full article
    const systemPrompt = getSystemPrompt(language);
    const articlePrompt = generateFullArticlePrompt({
      topic,
      language,
      ...promptParams,
    });

    const fullPrompt = `${systemPrompt}\n\n${articlePrompt}`;

    const response = await puterAI.chat(fullPrompt, { model });

    // Parse response untuk extract title, content, dan excerpt
    const parsed = parseGeneratedArticle(response);

    return parsed;
  } catch (error) {
    console.error('Error generating blog article:', error);
    throw error;
  }
}

/**
 * Generate artikel dengan streaming
 */
export async function* generateBlogArticleStream(
  options: GenerationOptions
): AsyncGenerator<string> {
  const { topic, language = 'id', model = 'gemini-2.5-flash-lite', ...promptParams } = options;

  if (!topic) {
    throw new Error('Topic is required for article generation');
  }

  const systemPrompt = getSystemPrompt(language);
  const articlePrompt = generateFullArticlePrompt({
    topic,
    language,
    ...promptParams,
  });

  const fullPrompt = `${systemPrompt}\n\n${articlePrompt}`;

  for await (const chunk of puterAI.chatStream(fullPrompt, { model })) {
    yield chunk;
  }
}

/**
 * Generate hanya title suggestions
 */
export async function generateTitleSuggestions(
  topic: string,
  language: 'id' | 'en' = 'id',
  model: string = 'gpt-5-nano'
): Promise<string[]> {
  const prompt = generateTitlePrompt(topic, language);
  const response = await puterAI.chat(prompt, { model });

  // Parse response to extract titles
  const titles = response
    .split('\n')
    .filter((line) => line.trim().match(/^\d+[\.\)]/))
    .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter((title) => title.length > 0);

  return titles;
}

/**
 * Generate excerpt dari content
 */
export async function generateExcerpt(
  title: string,
  content: string,
  language: 'id' | 'en' = 'id',
  model: string = 'gpt-5-nano'
): Promise<string> {
  const prompt = generateExcerptPrompt(title, content, language);
  const response = await puterAI.chat(prompt, { model });

  // Clean up response
  return response.trim().replace(/^["']|["']$/g, '');
}

/**
 * Improve existing content
 */
export async function improveContent(
  content: string,
  improvement: 'grammar' | 'seo' | 'engagement' | 'readability',
  language: 'id' | 'en' = 'id',
  model: string = 'gpt-5-nano'
): Promise<string> {
  const prompt = generateImprovePrompt(content, improvement, language);
  return await puterAI.chat(prompt, { model });
}

/**
 * Expand a specific section
 */
export async function expandSection(
  section: string,
  context: string,
  language: 'id' | 'en' = 'id',
  model: string = 'gpt-5-nano'
): Promise<string> {
  const prompt = generateExpandPrompt(section, context, language);
  return await puterAI.chat(prompt, { model });
}

/**
 * Parse generated article response
 */
function parseGeneratedArticle(response: string): GeneratedArticle {
  // Try to extract title from <h1> tag or first line
  let title = '';
  let content = response;
  let excerpt = '';

  // Extract title from H1 tag
  const h1Match = response.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].trim();
    content = response.replace(h1Match[0], '').trim();
  } else {
    // If no H1, use first line
    const lines = response.split('\n').filter((line) => line.trim());
    if (lines.length > 0) {
      title = lines[0].replace(/^#+\s*/, '').trim();
      content = lines.slice(1).join('\n').trim();
    }
  }

  // Extract excerpt from meta description or first paragraph
  const metaMatch = response.match(/meta description[:\s]+([^\n]+)/i);
  if (metaMatch) {
    excerpt = metaMatch[1].trim();
  } else {
    // Use first paragraph
    const pMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
    if (pMatch) {
      excerpt = pMatch[1].replace(/<[^>]+>/g, '').substring(0, 160);
    }
  }

  // Clean up content
  content = content
    .replace(/meta description[:\s]+[^\n]+/gi, '')
    .trim();

  return {
    title: title || 'Untitled Article',
    content: content || response,
    excerpt: excerpt || content.substring(0, 160),
  };
}

/**
 * Check if Puter AI is available
 */
export function isAIAvailable(): boolean {
  return puterAI.isAvailable();
}
