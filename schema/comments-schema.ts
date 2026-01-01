import {
    pgTable,
    text,
    timestamp,
    varchar,
    PgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { posts } from "./posts-schema";

export const comments = pgTable("comments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    content: text("content").notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }).notNull(),
    postId: text("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    parentId: text("parent_id")
        .references((): PgColumn => comments.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
