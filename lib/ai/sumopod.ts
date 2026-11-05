import OpenAI from "openai";

export const SUMOPOD_DEFAULT_BASE_URL = "https://ai.sumopod.com/v1";
export const SUMOPOD_DEFAULT_MODEL = "glm-5.3-flash";

export class SumoPodConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SumoPodConfigError";
  }
}

let cachedModelIds: string[] | null = null;
let cachedModelsFetchedAt = 0;
const MODELS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getSumoPodApiKey(): string {
  const apiKey = process.env.SUMOPOD_API_KEY?.trim();
  if (
    !apiKey ||
    apiKey === "your_sumopod_api_key_here" ||
    /^sk-x+$/i.test(apiKey)
  ) {
    throw new SumoPodConfigError(
      "SUMOPOD_API_KEY belum dikonfigurasi pada environment server (.env)."
    );
  }
  return apiKey;
}

export function getSumoPodClient(): OpenAI {
  const apiKey = getSumoPodApiKey();
  const baseURL =
    process.env.SUMOPOD_BASE_URL?.trim() || SUMOPOD_DEFAULT_BASE_URL;

  return new OpenAI({
    apiKey,
    baseURL,
    timeout: 50_000, // 50s timeout to abort cleanly before Vercel 60s hard limit
    maxRetries: 1,
  });
}

function isLegacyOrDefaultAlias(model?: string): boolean {
  if (!model) return true;
  const normalized = model.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "glm-flash" ||
    normalized === "glm-4-flash" ||
    normalized.startsWith("gemini-") ||
    normalized === "gpt-5-nano"
  );
}

async function fetchAvailableModelIds(client: OpenAI): Promise<string[]> {
  if (
    cachedModelIds &&
    Date.now() - cachedModelsFetchedAt < MODELS_CACHE_TTL_MS
  ) {
    return cachedModelIds;
  }

  try {
    const list = await client.models.list();
    const ids = (list.data || [])
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (ids.length > 0) {
      cachedModelIds = ids;
      cachedModelsFetchedAt = Date.now();
    }
    return ids;
  } catch {
    return [];
  }
}

/**
 * Resolves the target GLM Flash model ID against SumoPod's active /v1/models list
 * so slight naming variations (e.g. glm-4-flash, glm-4.5-flash, glm-4.7-flash) work seamlessly.
 */
export async function resolveSumoPodModel(
  client: OpenAI,
  requestedModel?: string
): Promise<string> {
  const envModel = process.env.SUMOPOD_MODEL?.trim();
  if (envModel) {
    return envModel;
  }

  // If a specific, non-legacy model was explicitly requested, use it directly (fast path)
  if (requestedModel && !isLegacyOrDefaultAlias(requestedModel)) {
    return requestedModel.trim();
  }

  // If auto-discovery is explicitly disabled or not requested, use default directly without network overhead
  if (process.env.SUMOPOD_AUTO_DISCOVER !== "true") {
    return SUMOPOD_DEFAULT_MODEL;
  }

  const preferred = SUMOPOD_DEFAULT_MODEL;
  const availableIds = await fetchAvailableModelIds(client);
  if (availableIds.length === 0) {
    return preferred;
  }

  // Exact match (case-insensitive)
  const exactMatch = availableIds.find(
    (id) => id.toLowerCase() === preferred.toLowerCase()
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Prefer GLM Flash variants when targeting GLM Flash
  if (/glm/i.test(preferred)) {
    const preferredPriority = [
      "glm-4.7-flash",
      "glm-4.5-flash",
      "glm-4-flash",
      "glm-5.3-flash",
      "glm-4-flashx",
      "glm-4.7-flashx",
    ];

    for (const candidate of preferredPriority) {
      const found = availableIds.find(
        (id) =>
          id.toLowerCase() === candidate ||
          id.toLowerCase().endsWith(`/${candidate}`)
      );
      if (found) return found;
    }

    const anyGlmFlash = availableIds.find((id) => /glm.*flash/i.test(id));
    if (anyGlmFlash) return anyGlmFlash;

    const anyGlm = availableIds.find((id) => /glm/i.test(id));
    if (anyGlm) return anyGlm;
  }

  return preferred;
}

/**
 * GLM 5.x Flash is a reasoning model: without limiting reasoning, the whole
 * max_tokens budget can be spent on `reasoning_content`, leaving `content` empty.
 * `reasoning_effort: "none"` keeps output in `content` and is ~4x faster.
 * Override with SUMOPOD_REASONING_EFFORT (none | low | medium | high | off).
 */
export function getReasoningParams(): Record<string, string> {
  const effort = (process.env.SUMOPOD_REASONING_EFFORT || "none")
    .trim()
    .toLowerCase();
  if (effort === "off" || effort === "") return {};
  return { reasoning_effort: effort };
}

/**
 * Removes ```html fences that chat models often wrap around HTML output.
 */
export function stripCodeFences(input: string): string {
  return input
    .trim()
    .replace(/^```(?:html|xml|markdown)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

export function buildChatMessages(
  prompt: string,
  systemPrompt?: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (systemPrompt?.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }
  messages.push({
    role: "user",
    content: prompt,
  });
  return messages;
}

