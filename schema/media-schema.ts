import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const mediaUploads = pgTable("media_uploads", {
  id: text("id").primaryKey(), // filename e.g. 1793851009389-flux-1793851007666.jpg
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(), // base64 encoded string
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MediaUpload = typeof mediaUploads.$inferSelect;
export type NewMediaUpload = typeof mediaUploads.$inferInsert;

