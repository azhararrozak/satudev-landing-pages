import {
    pgTable,
    text,
    timestamp,
    varchar,
    boolean,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { categories } from "./category-schema";

export type PostStatus = "draft" | "published";

export const posts = pgTable("posts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    status: varchar("status", { length: 20 }).$type<PostStatus>().notNull().default("draft"),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    categoryId: text("category_id")
        .references(() => categories.id, { onDelete: "set null" }),
    authorId: text("author_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
