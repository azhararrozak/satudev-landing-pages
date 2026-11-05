import { sql } from "@/lib/backend/db";

let isProductsTableInitialized = false;

/**
 * Ensures the `products` table exists in PostgreSQL.
 * Runs automatically on startup / first query so no manual database migration is required.
 */
export async function ensureProductsTable(): Promise<void> {
  if (isProductsTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image TEXT,
        price NUMERIC(12, 2),
        category VARCHAR(100),
        buy_links JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
    `;

    isProductsTableInitialized = true;
  } catch (error) {
    console.error("Failed to ensure products table in database:", error);
  }
}

