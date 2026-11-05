import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export type BuyLinkPlatform =
  | "shopee"
  | "tiktok"
  | "tokopedia"
  | "lazada"
  | "blibli"
  | "whatsapp"
  | "website"
  | "other";

export interface ProductBuyLink {
  platform: BuyLinkPlatform | string;
  label: string;
  url: string;
}

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  price: numeric("price", { precision: 12, scale: 2 }),
  category: varchar("category", { length: 100 }),
  buyLinks: json("buy_links").$type<ProductBuyLink[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ProductItem = typeof products.$inferSelect;
export type NewProductItem = typeof products.$inferInsert;

