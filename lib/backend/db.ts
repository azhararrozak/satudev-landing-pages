import {neon} from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from "@/schema/auth-schema"

// neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.DATABASE_URL || "postgres://mock:mock@localhost:5432/mock";
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

