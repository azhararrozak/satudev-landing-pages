"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  isPublished: boolean;
  publishedAt: Date | null;
  categoryId: string | null;
  categoryName: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      
      // Handle both old format (array) and new format (object with posts array)
      const postsData = data.posts || data;
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
      }

      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete post");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-[12px] bg-[#e8eefc] animate-pulse" />
            <div className="h-4 w-64 rounded-full bg-[#e8eefc]/70 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-[24px] bg-[#e8eefc] animate-pulse" />
        </div>
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-14 rounded-[12px] bg-[#e8eefc]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const tableLabelVars = {
    "--label-2": '"Kategori"',
    "--label-3": '"Status"',
    "--label-4": '"Tanggal"',
    "--label-5": '"Aksi"',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
            Artikel Blog
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#66666b] gamma-tabular">
            Kelola seluruh draf dan publikasi artikel ({posts.length} artikel)
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/posts/new")}
          className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-6 text-[15px] font-medium text-white transition hover:bg-[#043591]"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span>Tulis Artikel</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white">
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="posts-table-caption"
          className="gamma-table-wrapper"
        >
          <table className="gamma-table-responsive" style={tableLabelVars}>
            <caption id="posts-table-caption" className="sr-only">
              Daftar artikel blog beserta kategori, status publikasi, dan tanggal pembuatan
            </caption>
            <thead className="bg-[#f6f9ff]">
              <tr>
                <th
                  scope="col"
                  className="border-b border-[#dfdfe0] px-6 py-3.5 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#002253]"
                >
                  Judul Artikel
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
                  Status
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
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    data-empty-row=""
                    className="px-6 py-12 text-center text-sm font-medium text-[#66666b]"
                  >
                    Belum ada artikel. Klik tombol Tulis Artikel untuk mulai menulis.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const isPublished = post.status === "published";
                  return (
                    <tr key={post.id} className="hover:bg-[#f6f9ff] transition-colors">
                      <th
                        scope="row"
                        className="border-b border-[#eef2f8] px-6 py-4 text-left font-normal"
                      >
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-[#002253]">
                            {post.title}
                          </span>
                          <span className="mt-0.5 text-xs font-mono text-[#66666b]">
                            /{post.slug}
                          </span>
                        </div>
                      </th>
                      <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#38383c]">
                          {post.categoryName || "-"}
                        </span>
                      </td>
                      <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] ${
                            isPublished
                              ? "bg-[#e8eefc] text-[#002253] border border-[#d0e6fe]"
                              : "bg-[#fff1ea] text-[#b53800] border border-[#ffd8c4]"
                          }`}
                        >
                          {isPublished ? "Tayang" : "Draf"}
                        </span>
                      </td>
                      <td className="border-b border-[#eef2f8] px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#66666b] gamma-tabular">
                          {new Date(post.createdAt).toLocaleDateString("id-ID", {
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
                            aria-label={`Sunting ${post.title}`}
                            className="h-8 w-8 rounded-full p-0 text-[#002253] hover:bg-[#e8eefc]"
                            onClick={() => router.push(`/dashboard/posts/${post.id}`)}
                          >
                            <Pencil aria-hidden="true" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Hapus ${post.title}`}
                            onClick={() => handleDelete(post.id)}
                            className="h-8 w-8 rounded-full p-0 text-[#b53800] hover:bg-[#fff1ea] hover:text-[#b53800]"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
