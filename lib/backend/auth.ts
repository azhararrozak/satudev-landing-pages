import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { db } from './db'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/schema/auth-schema'

const rawAppUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

// Safety net: normalize legacy satudev.id env values to satudev.web.id
const appUrl = rawAppUrl.replace(
  /^(https?:\/\/(?:www\.)?)satudev\.id(?=\/|$)/i,
  "$1satudev.web.id"
);

const appHostname = (() => {
  try {
    return new URL(appUrl).hostname;
  } catch {
    return "localhost";
  }
})();

// Only enable cross-subdomain cookies on production satudev.web.id custom domain.
// Enabling it on localhost, 127.0.0.1, or *.vercel.app sets an invalid/mismatched
// Domain attribute that causes browsers to drop Set-Cookie after a 200 login.
const isProdCustomDomain =
  process.env.NODE_ENV === "production" &&
  (appHostname === "satudev.web.id" || appHostname.endsWith(".satudev.web.id"));

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  experimental: {
    joins: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  // Add additional field 'role' to the user model
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: true,
      }
    }
  },
  // Include user.role and session metadata directly in /sign-in/email & /sign-up/email
  // responses so the client does not need a second /get-session roundtrip.
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" && ctx.path !== "/sign-up/email") {
        return;
      }

      const newSession = ctx.context.newSession;
      const returned = ctx.context.returned;

      if (
        newSession &&
        returned &&
        typeof returned === "object" &&
        !(returned instanceof Response) &&
        "user" in returned &&
        returned.user &&
        typeof returned.user === "object"
      ) {
        const userWithRole = newSession.user as typeof newSession.user & {
          role?: string;
        };

        ctx.context.returned = {
          ...returned,
          user: {
            ...returned.user,
            role: userWithRole.role || "user",
          },
          session: {
            id: newSession.session.id,
            userId: newSession.session.userId,
            expiresAt: newSession.session.expiresAt,
            token: newSession.session.token,
          },
        };
      }
    }),
  },
  // Session configuration for production
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  trustedOrigins: Array.from(
    new Set(
      [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://www.satudev.web.id",
        "https://satudev.web.id",
        appUrl,
        process.env.BETTER_AUTH_URL || "",
        process.env.NEXT_PUBLIC_APP_URL || "",
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
      ].filter(Boolean)
    )
  ),
  // Advanced session options
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: isProdCustomDomain
      ? {
          enabled: true,
          domain: ".satudev.web.id",
        }
      : {
          enabled: false,
        },
  }
});

