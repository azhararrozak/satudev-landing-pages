/**
 * Blog Article Generator
 * Service utama untuk membuat artikel blog menggunakan SumoPod AI (GLM Flash)
 */

import { sumoPodAI } from "./gemini-client";
import {
  generateFullArticlePrompt,
  generateTitlePrompt,
  generateExcerptPrompt,
  generateImprovePrompt,
  generateExpandPrompt,
  getSystemPrompt,
  type BlogPromptParams,
} from "./prompts/blog-prompts";

export const DEFAULT_BLOG_AI_MODEL = "glm-4-flash";

export interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
}

export interface GenerationOptions extends BlogPromptParams {
  model?: string;
  useStreaming?: boolean;
}

const LENGTH_MAX_TOKENS: Record<
  NonNullable<BlogPromptParams["length"]>,
  number
> = {
  short: 2048,
  medium: 4096,
  long: 6144,
};

/**
 * Generate artikel blog lengkap menggunakan SumoPod AI (GLM Flash)
 */
export async function generateBlogArticle(
  options: GenerationOptions
): Promise<GeneratedArticle> {
  const {
    topic,
    language = "id",
    length = "medium",
    model = DEFAULT_BLOG_AI_MODEL,
    ...promptParams
  } = options;

  if (!topic) {
    throw new Error("Topic is required for article generation");
  }

  try {
    const systemPrompt = getSystemPrompt(language);
    const articlePrompt = generateFullArticlePrompt({
      topic,
      language,
      length,
      ...promptParams,
    });

    const response = await sumoPodAI.chat(articlePrompt, {
      model,
      systemPrompt,
      max_tokens: LENGTH_MAX_TOKENS[length],
      temperature: 0.7,
    });

    return parseGeneratedArticle(response, topic);
  } catch (error) {
    console.error("Error generating blog article:", error);
    throw error;
  }
}

/**
 * Generate artikel blog secara real-time (streaming)
 */
export async function* generateBlogArticleStream(
  options: GenerationOptions
): AsyncGenerator<string> {
  const {
    topic,
    language = "id",
    length = "medium",
    model = DEFAULT_BLOG_AI_MODEL,
    ...promptParams
  } = options;

  if (!topic) {
    throw new Error("Topic is required for article generation");
  }

  const systemPrompt = getSystemPrompt(language);
  const articlePrompt = generateFullArticlePrompt({
    topic,
    language,
    length,
    ...promptParams,
  });

  for await (const chunk of sumoPodAI.chatStream(articlePrompt, {
    model,
    systemPrompt,
    max_tokens: LENGTH_MAX_TOKENS[length],
    temperature: 0.7,
  })) {
    yield chunk;
  }
}

/**
 * Generate saran judul artikel
 */
export async function generateTitleSuggestions(
  topic: string,
  language: "id" | "en" = "id",
  model: string = DEFAULT_BLOG_AI_MODEL
): Promise<string[]> {
  const prompt = generateTitlePrompt(topic, language);
  const response = await sumoPodAI.chat(prompt, {
    model,
    max_tokens: 500,
    temperature: 0.8,
  });

  const titles = response
    .split("\n")
    .filter((line) => line.trim().match(/^\d+[\.\)]/))
    .map((line) =>
      line
        .replace(/^\d+[\.\)]\s*/, "")
        .replace(/^\*+|\*+$/g, "")
        .replace(/^["']|["']$/g, "")
        .trim()
    )
    .filter((title) => title.length > 0);

  return titles;
}

/**
 * Generate ringkasan singkat (excerpt) dari konten
 */
export async function generateExcerpt(
  title: string,
  content: string,
  language: "id" | "en" = "id",
  model: string = DEFAULT_BLOG_AI_MODEL
): Promise<string> {
  const prompt = generateExcerptPrompt(title, content, language);
  const response = await sumoPodAI.chat(prompt, {
    model,
    max_tokens: 250,
    temperature: 0.6,
  });

  return response.trim().replace(/^["']|["']$/g, "");
}

/**
 * Perbaiki kualitas konten yang sudah ada
 */
export async function improveContent(
  content: string,
  improvement: "grammar" | "seo" | "engagement" | "readability",
  language: "id" | "en" = "id",
  model: string = DEFAULT_BLOG_AI_MODEL
): Promise<string> {
  const prompt = generateImprovePrompt(content, improvement, language);
  const raw = await sumoPodAI.chat(prompt, {
    model,
    systemPrompt: getSystemPrompt(language),
    max_tokens: 4096,
    temperature: 0.6,
  });
  return stripMarkdownCodeFences(raw);
}

/**
 * Kembangkan bagian tertentu pada artikel
 */
export async function expandSection(
  section: string,
  context: string,
  language: "id" | "en" = "id",
  model: string = DEFAULT_BLOG_AI_MODEL
): Promise<string> {
  const prompt = generateExpandPrompt(section, context, language);
  const raw = await sumoPodAI.chat(prompt, {
    model,
    systemPrompt: getSystemPrompt(language),
    max_tokens: 2048,
    temperature: 0.7,
  });
  return stripMarkdownCodeFences(raw);
}

function stripMarkdownCodeFences(input: string): string {
  return input
    .trim()
    .replace(/^```(?:html|xml|markdown)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse output artikel HTML menjadi title, content, dan excerpt bersih
 */
export function parseGeneratedArticle(
  rawResponse: string,
  fallbackTitle = "Untitled Article"
): GeneratedArticle {
  const fencedResponse = stripMarkdownCodeFences(rawResponse);
  // Some models wrap the article in a full HTML document; keep only <body> content
  const bodyMatch = fencedResponse.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const cleanedResponse = (bodyMatch ? bodyMatch[1] : fencedResponse)
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?(?:html|head|body|article)[^>]*>/gi, "")
    .replace(/<(?:meta|title|link)[^>]*>(?:[^<]*<\/title>)?/gi, "")
    .trim();
  let title = "";
  let content = cleanedResponse;
  let excerpt = "";

  // Extract title from <h1>...</h1> if present
  const h1Match = cleanedResponse.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    title = stripHtmlTags(h1Match[1]);
    content = cleanedResponse.replace(h1Match[0], "").trim();
  } else {
    const lines = cleanedResponse.split("\n").filter((line) => line.trim());
    if (lines.length > 0 && !lines[0].trim().startsWith("<p")) {
      title = stripHtmlTags(lines[0].replace(/^#+\s*/, ""));
      content = lines.slice(1).join("\n").trim();
    }
  }

  // Extract Meta description if model emitted one
  const metaMatch = content.match(
    /(?:<p[^>]*>\s*)?(?:<strong>)?meta\s*description(?:\s*<\/strong>)?\s*[:\-]\s*([\s\S]*?)(?:<\/p>|\n|$)/i
  );
  if (metaMatch) {
    excerpt = stripHtmlTags(metaMatch[1]).substring(0, 160);
    content = content.replace(metaMatch[0], "").trim();
  }

  // Fallback excerpt from the first <p> tag or plain text
  if (!excerpt) {
    const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      excerpt = stripHtmlTags(pMatch[1]).substring(0, 160);
    } else {
      excerpt = stripHtmlTags(content).substring(0, 160);
    }
  }

  return {
    title: title || fallbackTitle,
    content: content || cleanedResponse,
    excerpt,
  };
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return sumoPodAI.isAvailable();
}
