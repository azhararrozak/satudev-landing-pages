import {
    pgTable,
    text,
    timestamp,
    varchar,
    primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth-schema";
import { posts } from "./posts-schema";

export const tags = pgTable("tags", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdBy: text("created_by")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Junction table for many-to-many relationship between posts and tags
export const postsToTags = pgTable(
    "posts_to_tags",
    {
        postId: text("post_id")
            .notNull()
            .references(() => posts.id, { onDelete: "cascade" }),
        tagId: text("tag_id")
            .notNull()
            .references(() => tags.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.postId, t.tagId] }),
    })
);

// Relations
export const tagsRelations = relations(tags, ({ many }) => ({
    postsToTags: many(postsToTags),
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
    post: one(posts, {
        fields: [postsToTags.postId],
        references: [posts.id],
    }),
    tag: one(tags, {
        fields: [postsToTags.tagId],
        references: [tags.id],
    }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostToTag = typeof postsToTags.$inferSelect;
export type NewPostToTag = typeof postsToTags.$inferInsert;