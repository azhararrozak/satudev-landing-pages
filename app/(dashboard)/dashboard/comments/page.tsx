"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  postId: string;
  postTitle: string | null;
  postSlug: string | null;
  parentId: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch("/api/comments");
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    }
  };

  const handleReply = async (commentId: string, postId: string) => {
    if (!replyContent.trim() || !replyName.trim() || !replyEmail.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          authorName: replyName,
          authorEmail: replyEmail,
          postId: postId,
          parentId: commentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post reply");
      }

      toast.success("Reply posted successfully");
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post reply"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8 space-y-2">
          <div className="h-7 w-48 rounded-[12px] bg-[#e8eefc] animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-[#e8eefc]/70 animate-pulse" />
        </div>
        <div className="rounded-[24px] border border-[#dfdfe0] bg-white p-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-[12px] bg-[#e8eefc]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#dfdfe0] bg-white p-6 sm:p-8">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.6px] leading-tight text-[#002253]">
            Diskusi & Komentar
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] font-medium text-[#66666b] gamma-tabular">
            Tinjau dan balas tanggapan pembaca pada artikel blog ({comments.length} komentar)
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#dfdfe0] bg-white">
        {comments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8eefc] text-[#002253]">
              <MessageSquare aria-hidden="true" className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-[#66666b]">
              Belum ada komentar masuk pada artikel blog.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#dfdfe0]">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="text-[16px] font-bold text-[#002253]">
                        {comment.authorName}
                      </h2>
                      <span className="text-xs font-medium text-[#66666b]">
                        {comment.authorEmail}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-[#66666b] gamma-tabular">
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.postTitle && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[#38383c]">
                            pada {comment.postTitle}
                          </span>
                          {comment.postSlug && (
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Buka artikel ${comment.postTitle}`}
                              onClick={() =>
                                router.push(`/blog/${comment.postSlug}`)
                              }
                              className="h-6 w-6 rounded-full p-0 text-[#0540ad] hover:bg-[#e8eefc]"
                            >
                              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    <p className="mt-3 text-[15px] font-medium leading-[1.6] text-[#38383c] whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(comment.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-[24px] border border-[#dfdfe0] bg-white px-4 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
                    >
                      <MessageSquare aria-hidden="true" className="h-3.5 w-3.5 text-[#0540ad]" />
                      <span>Balas</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus komentar dari ${comment.authorName}`}
                      onClick={() => handleDelete(comment.id)}
                      className="h-9 w-9 rounded-full p-0 text-[#b53800] hover:bg-[#fff1ea] hover:text-[#b53800]"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-5 rounded-[12px] border border-[#dfdfe0] bg-[#f8faff] p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#002253]">
                      Balas komentar {comment.authorName}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`replyName-${comment.id}`} className="text-[#002253]">
                          Nama Penulis
                        </Label>
                        <Input
                          id={`replyName-${comment.id}`}
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          placeholder="Nama Anda"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`replyEmail-${comment.id}`} className="text-[#002253]">
                          Email
                        </Label>
                        <Input
                          id={`replyEmail-${comment.id}`}
                          type="email"
                          value={replyEmail}
                          onChange={(e) => setReplyEmail(e.target.value)}
                          placeholder="email@satudev.web.id"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`replyContent-${comment.id}`} className="text-[#002253]">
                        Isi Balasan
                      </Label>
                      <Textarea
                        id={`replyContent-${comment.id}`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Tulis tanggapan Anda..."
                        rows={3}
                        className="bg-white"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleReply(comment.id, comment.postId)}
                        disabled={isSubmitting}
                        className="inline-flex h-10 items-center gap-2 rounded-[24px] bg-[#0540ad] px-5 text-sm font-medium text-white transition hover:bg-[#043591] disabled:opacity-50"
                      >
                        {isSubmitting && (
                          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                        )}
                        <span>Kirim Balasan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                          setReplyName("");
                          setReplyEmail("");
                        }}
                        className="inline-flex h-10 items-center rounded-[24px] border border-[#dfdfe0] bg-white px-5 text-sm font-medium text-[#002253] transition hover:bg-[#e8eefc]/60"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
