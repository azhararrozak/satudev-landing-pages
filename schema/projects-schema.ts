import {
    pgTable,
    text,
    timestamp,
    varchar,
    boolean,
    json,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const projects = pgTable("projects", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    image: text("image"),
    category: varchar("category", { length: 100 }),
    tech: json("tech").$type<string[]>().default([]),
    link: text("link"),
    githubUrl: text("github_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdBy: text("created_by")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ProjectItem = typeof projects.$inferSelect;
export type NewProjectItem = typeof projects.$inferInsert;
