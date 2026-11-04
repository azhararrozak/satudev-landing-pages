"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { TagSelector } from "@/components/ui/tag-selector";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postId, setPostId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    status: "draft",
    categoryId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
      await Promise.all([
        fetchPost(resolvedParams.id),
        fetchCategories(),
        fetchPostTags(resolvedParams.id)
      ]);
    };
    loadData();
  }, [params]);

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      
      setFormData({
        title: data.title || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        featuredImage: data.featuredImage || "",
        status: data.status || "draft",
        categoryId: data.categoryId || "",
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPostTags = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}/tags`);
      if (!response.ok) throw new Error("Failed to fetch post tags");
      const data = await response.json();
      setSelectedTags(data.map((tag: { id: string }) => tag.id));
    } catch (error) {
      console.error("Error fetching post tags:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !postId) return;

    setIsSubmitting(true);

    try {
      // Update post
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      // Update tags
      const tagsResponse = await fetch(`/api/posts/${postId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: selectedTags }),
      });

      if (!tagsResponse.ok) {
        console.error("Failed to update tags");
        toast.error("Post updated but failed to update tags");
      }

      toast.success("Post updated successfully");
      router.push("/dashboard/posts");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-[#e8eefc] animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-44 rounded-[12px] bg-[#e8eefc] animate-pulse" />
            <div className="h-4 w-56 rounded-full bg-[#e8eefc]/70 animate-pulse" />
          </div>
        </div>
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 space-y-4">
          <div className="h-10 rounded-[12px] bg-[#e8eefc]/60 animate-pulse" />
          <div className="h-40 rounded-[12px] bg-[#e8eefc]/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-[#002253] transition hover:bg-[#e8eefc]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.5px] leading-tight text-[#002253]">
            Sunting Artikel
          </h1>
          <p className="mt-0.5 text-sm font-medium text-[#66666b]">
            Perbarui konten dan status publikasi artikel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#002253]">Judul Artikel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Masukkan judul artikel"
            required
          />
          <p className="text-xs text-[#66666b]">
            Slug URL diperbarui otomatis mengikuti judul artikel.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-[#002253]">Ringkasan Singkat</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            placeholder="Deskripsi singkat artikel (opsional)"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-[#002253]">Isi Artikel *</Label>
          <TiptapEditor
            content={formData.content}
            onChange={(content) =>
              setFormData({ ...formData, content })
            }
            placeholder="Tulis isi artikel di sini..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="featuredImage" className="text-[#002253]">URL Gambar Utama</Label>
            <Input
              id="featuredImage"
              value={formData.featuredImage}
              onChange={(e) =>
                setFormData({ ...formData, featuredImage: e.target.value })
              }
              placeholder="https://satudev.web.id/image.jpg"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-[#002253]">Kategori</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full h-11 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] focus:outline-none focus:ring-2 focus:ring-[#0540ad]"
            >
              <option value="">Pilih kategori (opsional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <TagSelector
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            label="Tags"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-[#002253]">Status Publikasi</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full h-11 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] focus:outline-none focus:ring-2 focus:ring-[#0540ad]"
          >
            <option value="draft">Draf</option>
            <option value="published">Tayang</option>
          </select>
          <p className="text-xs text-[#66666b]">
            Artikel berstatus Tayang akan tampil di halaman blog publik.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#dfdfe0]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-sm font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
          >
            {isSubmitting && (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            )}
            <span>Perbarui Artikel</span>
          </button>
        </div>
      </form>
    </div>
  );
}