import { NextResponse } from "next/server";

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin") || "*";

  return {
    "Access-Control-Allow-Origin": origin === "null" ? "*" : origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleCorsPreflight(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export function jsonWithCors<T>(
  data: T,
  init?: ResponseInit,
  request?: Request
): NextResponse<T> {
  const corsHeaders = getCorsHeaders(request);
  const existingHeaders = new Headers(init?.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    existingHeaders.set(key, value);
  });

  return NextResponse.json(data, {
    ...init,
    headers: existingHeaders,
  });
}

