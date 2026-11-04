"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/use-auth";
import { Tag } from "@/schema/tags-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TagsPage() {
  const { user } = useUser();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      const url = editingTag
        ? `/api/tags/${editingTag.id}`
        : "/api/tags";
      const method = editingTag ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save tag");
      }

      toast.success(
        editingTag
          ? "Tag updated successfully"
          : "Tag created successfully"
      );

      setIsDialogOpen(false);
      resetForm();
      fetchTags();
    } catch (error) {
      console.error("Error saving tag:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tag");
      }

      toast.success("Tag deleted successfully");
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete tag");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingTag(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-[12px] bg-[#e8eefc] animate-pulse" />
            <div className="h-4 w-56 rounded-full bg-[#e8eefc]/70 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-[24px] bg-[#e8eefc] animate-pulse" />
        </div>
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 rounded-[12px] bg-[#e8eefc]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const tableLabelVars = {
    "--label-2": '"Slug"',
    "--label-3": '"Deskripsi"',
    "--label-4": '"Tanggal"',
    "--label-5": '"Aksi"',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
            Label & Tag
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#66666b] gamma-tabular">
            Kelola kata kunci penanda artikel ({tags.length} tag)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591]"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              <span>Tambah Tag</span>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-[24px] border-[#dfdfe0]">
            <DialogHeader>
              <DialogTitle className="text-[#002253]">
                {editingTag ? "Sunting Tag" : "Tambah Tag Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#002253]">Nama Tag</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Next.js"
                  required
                />
                <p className="text-xs text-[#66666b]">
                  Slug URL akan dibuat otomatis dari nama tag.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#002253]">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Penjelasan singkat penggunaan tag (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDialogClose(false)}
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
                  <span>{editingTag ? "Perbarui" : "Simpan"}</span>
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white">
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="tags-table-caption"
          className="gamma-table-wrapper"
        >
          <table className="gamma-table-responsive" style={tableLabelVars}>
            <caption id="tags-table-caption" className="sr-only">
              Daftar tag artikel beserta slug, deskripsi, dan tanggal pembuatan
            </caption>
            <thead className="bg-[#f6f9ff]">
              <tr>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Nama
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Slug
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Deskripsi
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-right text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tags.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    data-empty-row=""
                    className="px-6 py-12 text-center text-sm font-medium text-[#66666b]"
                  >
                    Belum ada tag terdaftar. Tambahkan tag pertama untuk artikel blog.
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-[#f6f9ff] transition-colors">
                    <th
                      scope="row"
                      className="border-b border-[#eef2f8] px-6 py-4 text-left whitespace-nowrap font-normal"
                    >
                      <span className="text-[15px] font-bold text-[#002253]">
                        {tag.name}
                      </span>
                    </th>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                      <span className="inline-block rounded-full bg-[#e8eefc] px-3 py-1 font-mono text-xs font-medium text-[#002253]">
                        {tag.slug}
                      </span>
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4">
                      <span className="block max-w-md truncate text-sm font-medium text-[#38383c]">
                        {tag.description || "-"}
                      </span>
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#66666b] gamma-tabular">
                        {new Date(tag.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Sunting tag ${tag.name}`}
                          className="h-8 w-8 rounded-full p-0 text-[#002253] hover:bg-[#e8eefc]"
                          onClick={() => handleEdit(tag)}
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Hapus tag ${tag.name}`}
                          onClick={() => handleDelete(tag.id)}
                          className="h-8 w-8 rounded-full p-0 text-[#b53800] hover:bg-[#fff1ea] hover:text-[#b53800]"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}