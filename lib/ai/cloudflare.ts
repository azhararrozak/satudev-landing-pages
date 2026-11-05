export const CLOUDFLARE_DEFAULT_FLUX_MODEL =
  "@cf/black-forest-labs/flux-1-schnell";

export class CloudflareWorkersAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudflareWorkersAIConfigError";
  }
}

export interface CloudflareWorkersAIConfig {
  accountId: string;
  apiToken: string;
  model: string;
}

export function getCloudflareWorkersAIConfig(): CloudflareWorkersAIConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken =
    process.env.CLOUDFLARE_API_TOKEN?.trim() ||
    process.env.CLOUDFLARE_API_KEY?.trim();

  if (!accountId || accountId === "your_cloudflare_account_id_here") {
    throw new CloudflareWorkersAIConfigError(
      "CLOUDFLARE_ACCOUNT_ID belum dikonfigurasi pada file .env."
    );
  }

  if (
    !apiToken ||
    apiToken === "your_cloudflare_api_token_here" ||
    /^sk-x+$/i.test(apiToken)
  ) {
    throw new CloudflareWorkersAIConfigError(
      "CLOUDFLARE_API_TOKEN belum dikonfigurasi pada file .env."
    );
  }

  const model =
    process.env.CLOUDFLARE_FLUX_MODEL?.trim() || CLOUDFLARE_DEFAULT_FLUX_MODEL;

  return { accountId, apiToken, model };
}

export interface FluxGenerateOptions {
  steps?: number;
  seed?: number;
  model?: string;
  noText?: boolean;
  aspectRatio?: "16:9" | "1:1";
}

/**
 * Optimizes a prompt for FLUX.1 to prevent unwanted text/typography
 * and direct the composition towards a horizontal banner framing when desired.
 */
export function formatBannerPrompt(
  prompt: string,
  options: { noText?: boolean; isBanner?: boolean } = {}
): string {
  let cleaned = prompt.trim();

  // Strip negative prompt phrasing that accidentally triggers text generation in T5
  cleaned = cleaned
    .replace(/\b(?:no\s+text|without\s+text|no\s+words|don'?t\s+write\s+text)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (options.noText !== false && !cleaned.toLowerCase().includes("textless")) {
    cleaned = `${cleaned}, textless, pure visual imagery, clean background, no typography`;
  }

  if (options.isBanner && !cleaned.toLowerCase().includes("panoramic")) {
    cleaned = `${cleaned}, wide angle horizontal composition, panoramic banner framing, centered focal point`;
  }

  return cleaned;
}

export interface FluxGenerateResult {
  imageBytes: string; // base64 string
  mimeType: string;
  model: string;
}

/**
 * Generate image using Cloudflare Workers AI with FLUX.1 [schnell]
 * Documentation: https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/
 */
export async function generateFluxImage(
  prompt: string,
  options: FluxGenerateOptions = {}
): Promise<FluxGenerateResult> {
  const config = getCloudflareWorkersAIConfig();
  const model = options.model || config.model;

  // Optimize prompt for textless output and banner composition by default
  const effectivePrompt = formatBannerPrompt(prompt, {
    noText: options.noText !== false,
    isBanner: options.aspectRatio === "16:9" || options.aspectRatio === undefined,
  });

  // Prompt constraints: min 1, max 2048 chars
  const trimmedPrompt = effectivePrompt.trim().slice(0, 2048);
  if (!trimmedPrompt) {
    throw new Error("Prompt is required for image generation.");
  }

  // Steps constraint for FLUX.1 [schnell]: 1 to 8 (default 4)
  let steps = typeof options.steps === "number" ? Math.round(options.steps) : 4;
  if (Number.isNaN(steps) || steps < 1) steps = 4;
  if (steps > 8) steps = 8;

  const requestBody: {
    prompt: string;
    steps: number;
    seed?: number;
  } = {
    prompt: trimmedPrompt,
    steps,
  };

  if (typeof options.seed === "number" && !Number.isNaN(options.seed)) {
    requestBody.seed = options.seed;
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${model}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(50_000),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let errorMessage = `Cloudflare Workers AI error (${response.status}): ${response.statusText}`;
    try {
      if (contentType.includes("application/json")) {
        const errorJson = await response.json();
        const cfErrors = (errorJson?.errors || [])
          .map((e: { message?: string }) => e.message)
          .filter(Boolean)
          .join(", ");
        if (cfErrors) {
          errorMessage = `Cloudflare Workers AI: ${cfErrors}`;
        } else if (errorJson?.message) {
          errorMessage = `Cloudflare Workers AI: ${errorJson.message}`;
        }
      } else {
        const errorText = await response.text();
        if (errorText) errorMessage = `Cloudflare Workers AI: ${errorText}`;
      }
    } catch {
      // Keep standard errorMessage
    }
    throw new Error(errorMessage);
  }

  // Case 1: Standard JSON response with base64 encoded image
  if (contentType.includes("application/json")) {
    const json = await response.json();

    if (!json?.success && json?.errors?.length > 0) {
      const errs = json.errors
        .map((e: { message?: string }) => e.message)
        .join(", ");
      throw new Error(`Cloudflare Workers AI error: ${errs}`);
    }

    const base64Image = json?.result?.image;
    if (!base64Image) {
      throw new Error("No image data returned from Cloudflare Workers AI.");
    }

    // Clean possible data URI prefix if returned
    const cleanBase64 = base64Image.replace(
      /^data:image\/[a-zA-Z]+;base64,/,
      ""
    );

    return {
      imageBytes: cleanBase64,
      mimeType: "image/jpeg",
      model,
    };
  }

  // Case 2: Binary image response
  const arrayBuffer = await response.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = contentType.includes("image/png")
    ? "image/png"
    : "image/jpeg";

  return {
    imageBytes: base64Data,
    mimeType,
    model,
  };
}

