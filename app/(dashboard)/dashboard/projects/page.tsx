"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/use-auth";
import { ProjectItem } from "@/schema/projects-schema";
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
import { Plus, Pencil, Trash2, Loader2, Upload, ExternalLink, Github, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    tech: "",
    link: "",
    githubUrl: "",
    isFeatured: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/featured-image", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to upload image");

      setFormData((prev) => ({ ...prev, image: result.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const techArray = formData.tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tech: techArray,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save project");
      }

      toast.success(
        editingProject
          ? "Project updated successfully"
          : "Project created successfully"
      );

      setIsDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image || "",
      category: project.category || "",
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : "",
      link: project.link || "",
      githubUrl: project.githubUrl || "",
      isFeatured: project.isFeatured || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete project");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      category: "",
      tech: "",
      link: "",
      githubUrl: "",
      isFeatured: false,
    });
    setEditingProject(null);
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
            <div className="h-7 w-44 rounded-[12px] bg-[#e8eefc] animate-pulse" />
            <div className="h-4 w-72 max-w-full rounded-full bg-[#e8eefc]/70 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-[24px] bg-[#e8eefc] animate-pulse" />
        </div>
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-[12px] bg-[#e8eefc]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const tableLabelVars = {
    "--label-2": '"Kategori"',
    "--label-3": '"Teknologi"',
    "--label-4": '"Tanggal"',
    "--label-5": '"Aksi"',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
            Portofolio Proyek
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#66666b] gamma-tabular">
            Kelola daftar karya portofolio pada halaman publik ({projects.length} proyek)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591]"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              <span>Tambah Proyek</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[24px] border-[#dfdfe0]">
            <DialogHeader>
              <DialogTitle className="text-[#002253]">
                {editingProject ? "Sunting Proyek" : "Tambah Proyek Baru"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#002253]">Judul Proyek *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: ExamSafe Mobile App"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#002253]">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Contoh: mobile, web, design, backend"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#002253]">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ringkasan singkat fitur dan solusi proyek..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#002253]">Gambar Proyek</Label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <Input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="URL gambar atau unggah file..."
                  />
                  <div className="relative flex-shrink-0">
                    <input
                      type="file"
                      id="image-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image-file"
                      className="cursor-pointer inline-flex items-center justify-center rounded-[24px] text-sm font-medium border border-[#dfdfe0] bg-white text-[#002253] hover:bg-[#e8eefc]/60 h-10 px-4"
                    >
                      {isUploading ? (
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Upload aria-hidden="true" className="h-4 w-4 mr-1.5" />
                      )}
                      Unggah
                    </Label>
                  </div>
                </div>
                {formData.image && (
                  <div className="mt-2 relative w-32 h-20 rounded-[12px] border border-[#dfdfe0] overflow-hidden bg-[#f6f9ff]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image}
                      alt="Pratinjau proyek"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech" className="text-[#002253]">Teknologi (pisahkan dengan koma)</Label>
                <Input
                  id="tech"
                  value={formData.tech}
                  onChange={(e) =>
                    setFormData({ ...formData, tech: e.target.value })
                  }
                  placeholder="Contoh: Next.js, TypeScript, PostgreSQL"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-[#002253]">Tautan Demo (opsional)</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://satudev.web.id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-[#002253]">Repositori GitHub (opsional)</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="rounded border-[#dfdfe0] text-[#0540ad] focus:ring-[#0540ad] h-4 w-4"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer text-[#38383c]">
                  Tampilkan sebagai proyek unggulan di halaman utama
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#dfdfe0]">
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
                  disabled={isSubmitting || isUploading}
                  className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-sm font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  )}
                  <span>{editingProject ? "Perbarui Proyek" : "Simpan Proyek"}</span>
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
          aria-labelledby="projects-table-caption"
          className="gamma-table-wrapper"
        >
          <table className="gamma-table-responsive" style={tableLabelVars}>
            <caption id="projects-table-caption" className="sr-only">
              Daftar proyek portofolio beserta kategori, teknologi, dan tanggal pembuatan
            </caption>
            <thead className="bg-[#f6f9ff]">
              <tr>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Proyek
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Kategori
                </th>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Teknologi
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
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    data-empty-row=""
                    className="px-6 py-12 text-center text-sm font-medium text-[#66666b]"
                  >
                    Belum ada proyek portofolio. Klik Tambah Proyek untuk menambahkan karya pertama.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f6f9ff] transition-colors">
                    <th
                      scope="row"
                      className="border-b border-[#eef2f8] px-6 py-4 text-left font-normal"
                    >
                      <div className="flex items-center gap-3.5">
                        {project.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-12 h-12 rounded-[12px] object-cover border border-[#dfdfe0] bg-[#f6f9ff] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-[12px] border border-[#dfdfe0] bg-[#e8eefc] flex items-center justify-center text-[#002253] flex-shrink-0">
                            <ImageIcon aria-hidden="true" className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[15px] font-bold text-[#002253] flex flex-wrap items-center gap-2">
                            <span className="truncate">{project.title}</span>
                            {project.isFeatured && (
                              <span className="inline-flex items-center rounded-full bg-[#d0e6fe] border border-[#b8d8fc] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-[#002253]">
                                Unggulan
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[#66666b] line-clamp-1 max-w-sm">
                            {project.description}
                          </div>
                        </div>
                      </div>
                    </th>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                      {project.category ? (
                        <span className="inline-block rounded-full bg-[#e8eefc] px-3 py-1 font-mono text-xs font-medium text-[#002253]">
                          {project.category}
                        </span>
                      ) : (
                        <span className="text-xs text-[#66666b]">-</span>
                      )}
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs justify-end sm:justify-start">
                        {Array.isArray(project.tech) && project.tech.length > 0 ? (
                          project.tech.map((t, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-[#dfdfe0] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#38383c]"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#66666b]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#66666b] gamma-tabular">
                        {new Date(project.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Buka demo ${project.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#66666b] transition hover:bg-[#e8eefc] hover:text-[#002253]"
                          >
                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Buka GitHub ${project.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#66666b] transition hover:bg-[#e8eefc] hover:text-[#002253]"
                          >
                            <Github aria-hidden="true" className="h-4 w-4" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Sunting ${project.title}`}
                          className="h-8 w-8 rounded-full p-0 text-[#002253] hover:bg-[#e8eefc]"
                          onClick={() => handleEdit(project)}
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Hapus ${project.title}`}
                          onClick={() => handleDelete(project.id)}
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
