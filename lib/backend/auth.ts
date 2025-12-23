import { betterAuth } from 'better-auth'
import { db } from './db'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/schema/auth-schema'

export const auth = betterAuth({
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
  }
});

