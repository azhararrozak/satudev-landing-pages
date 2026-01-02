# Fitur CRUD Tags dengan Relasi Many-to-Many ke Posts

Fitur ini memungkinkan Anda untuk membuat, membaca, memperbarui, dan menghapus tags, serta menghubungkan tags dengan posts dalam relasi many-to-many (satu post dapat memiliki banyak tags, dan satu tag dapat dimiliki banyak posts).

## 📁 Struktur Database

### Tables
1. **tags** - Tabel utama untuk menyimpan tags
2. **posts_to_tags** - Junction table untuk relasi many-to-many

### Schema Tags
```typescript
export const tags = pgTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Junction Table (Posts to Tags)
```typescript
export const postsToTags = pgTable(
  "posts_to_tags",
  {
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);
```

## 🛣️ API Endpoints

### Tags CRUD

#### 1. Get All Tags
```
GET /api/tags
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "JavaScript",
    "slug": "javascript",
    "description": "Programming language",
    "createdBy": "user-id",
    "createdAt": "2026-01-02T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
]
```

#### 2. Create Tag
```
POST /api/tags
```
**Authorization:** Admin atau Penulis

**Request Body:**
```json
{
  "name": "React",
  "description": "JavaScript library for building UIs"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "React",
  "slug": "react",
  "description": "JavaScript library for building UIs",
  "createdBy": "user-id",
  "createdAt": "2026-01-02T00:00:00.000Z",
  "updatedAt": "2026-01-02T00:00:00.000Z"
}
```

#### 3. Get Single Tag
```
GET /api/tags/:id
```

#### 4. Update Tag
```
PUT /api/tags/:id
```
**Authorization:** Admin atau Penulis

**Request Body:**
```json
{
  "name": "React.js",
  "description": "Updated description"
}
```

#### 5. Delete Tag
```
DELETE /api/tags/:id
```
**Authorization:** Admin only

### Post Tags Management

#### 1. Get All Tags for a Post
```
GET /api/posts/:id/tags
```

**Response:**
```json
[
  {
    "id": "tag-uuid",
    "name": "JavaScript",
    "slug": "javascript",
    "description": "Programming language",
    "createdAt": "2026-01-02T00:00:00.000Z"
  }
]
```

#### 2. Update Tags for a Post
```
PUT /api/posts/:id/tags
```
**Authorization:** Admin atau Penulis

**Request Body:**
```json
{
  "tagIds": ["tag-uuid-1", "tag-uuid-2", "tag-uuid-3"]
}
```

**Catatan:** Endpoint ini akan menghapus semua tags yang ada dan mengganti dengan tags baru yang dikirim.

#### 3. Remove Specific Tag from Post
```
DELETE /api/posts/:id/tags?tagId=tag-uuid
```
**Authorization:** Admin atau Penulis

## 🖥️ Penggunaan di Frontend

### 1. Halaman Dashboard Tags
Akses: `/dashboard/tags`

Fitur:
- ✅ Lihat semua tags dalam tabel
- ✅ Tambah tag baru melalui dialog
- ✅ Edit tag yang sudah ada
- ✅ Hapus tag

### 2. Form Create/Edit Post dengan Tag Selector

Komponen `TagSelector` digunakan di:
- `/dashboard/posts/new` - Create post baru
- `/dashboard/posts/[id]` - Edit post yang ada

**Cara Penggunaan:**
```tsx
import { TagSelector } from "@/components/ui/tag-selector";

// Di dalam komponen
const [selectedTags, setSelectedTags] = useState<string[]>([]);

<TagSelector
  selectedTags={selectedTags}
  onChange={setSelectedTags}
  label="Tags"
/>
```

**Fitur TagSelector:**
- Multi-select dropdown untuk memilih tags
- Tampilan badges untuk tags yang dipilih
- Hapus tag dengan klik tombol X
- Auto-load semua available tags dari API

### 3. Menyimpan Tags saat Create Post
```typescript
// Setelah post dibuat
const newPost = await response.json();

if (selectedTags.length > 0) {
  await fetch(`/api/posts/${newPost.id}/tags`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagIds: selectedTags }),
  });
}
```

### 4. Update Tags saat Edit Post
```typescript
// Load tags saat mount
useEffect(() => {
  const loadTags = async () => {
    const response = await fetch(`/api/posts/${postId}/tags`);
    const data = await response.json();
    setSelectedTags(data.map((tag) => tag.id));
  };
  loadTags();
}, [postId]);

// Update tags saat submit
await fetch(`/api/posts/${postId}/tags`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tagIds: selectedTags }),
});
```

## 🔐 Authorization

### Permissions:
- **Admin**: Full access (CRUD tags, manage post tags)
- **Penulis**: Can create/edit tags, manage post tags
- **Pembaca**: Read-only access
- **Public**: Can view tags on published posts

## 🎨 UI Components

### TagSelector Component
File: `/components/ui/tag-selector.tsx`

Props:
- `selectedTags`: string[] - Array of tag IDs
- `onChange`: (tagIds: string[]) => void - Callback function
- `label?`: string - Optional label text

Features:
- Dropdown selection with checkmarks
- Selected tags displayed as badges
- Remove tags individually
- Responsive design

## 📝 Database Migration

Migration file telah dibuat: `drizzle/0006_dashing_nightshade.sql`

Untuk apply migration:
```bash
npx drizzle-kit push
```

Atau jika sudah di-push, cek status:
```bash
npx drizzle-kit migrate
```

## 🚀 Cara Menggunakan

1. **Buat Tags** - Pergi ke `/dashboard/tags` dan buat beberapa tags
2. **Buat Post** - Pergi ke `/dashboard/posts/new`
3. **Pilih Tags** - Gunakan TagSelector untuk memilih tags untuk post
4. **Publish** - Post dengan tags siap dipublish
5. **Edit** - Edit post dan tags dapat diubah kapan saja

## 📊 Query Examples dengan Drizzle ORM

### Get Post dengan Tags-nya
```typescript
const postWithTags = await db
  .select({
    post: posts,
    tags: tags,
  })
  .from(posts)
  .leftJoin(postsToTags, eq(posts.id, postsToTags.postId))
  .leftJoin(tags, eq(postsToTags.tagId, tags.id))
  .where(eq(posts.id, postId));
```

### Get Tags dengan jumlah Posts
```typescript
const tagsWithCount = await db
  .select({
    tag: tags,
    postCount: count(postsToTags.postId),
  })
  .from(tags)
  .leftJoin(postsToTags, eq(tags.id, postsToTags.tagId))
  .groupBy(tags.id);
```

## 🎯 Next Steps (Optional Enhancements)

1. **Display Tags on Blog Posts** - Show tags on individual post pages
2. **Tag Filter** - Filter posts by tag on blog listing page
3. **Tag Cloud** - Display popular tags
4. **Tag Analytics** - Track tag usage statistics
5. **Bulk Operations** - Add/remove tags to multiple posts at once

## 📚 References

- Schema: `/schema/tags-schema.ts`
- API Routes: `/app/api/tags/**`
- UI Component: `/components/ui/tag-selector.tsx`
- Dashboard: `/app/(dashboard)/dashboard/tags/page.tsx`
