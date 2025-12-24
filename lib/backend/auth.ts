import { betterAuth } from 'better-auth'
import { db } from './db'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/schema/auth-schema'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
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
  trustedOrigins: [
    "http://localhost:3000",
    "https://www.satudev.id",
    "https://satudev.id",
    process.env.NEXT_PUBLIC_APP_URL || ""
  ].filter(Boolean)
});

