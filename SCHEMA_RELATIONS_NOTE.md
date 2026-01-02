# Circular Import Fix for Posts-Tags Relations

Karena ada circular dependency antara posts dan tags schema, kita perlu mendefinisikan relasi di file terpisah atau menggunakan lazy import. Untuk sekarang, relasi sudah didefinisikan di tags-schema.ts dan dapat digunakan melalui query builder Drizzle ORM.

## Alternative: Jika ingin menggunakan relasi lengkap

Buat file `/schema/relations.ts`:

```typescript
import { relations } from "drizzle-orm";
import { posts } from "./posts-schema";
import { tags, postsToTags } from "./tags-schema";

export const postsRelations = relations(posts, ({ many }) => ({
  postsToTags: many(postsToTags),
}));

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
```

Dan import di index.ts setelah semua schema di-import.

Untuk sekarang, relasi manual query sudah berfungsi dengan baik.
