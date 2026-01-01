"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare, Reply } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/use-auth";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isAuthenticated } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });
  const [replyFormData, setReplyFormData] = useState({
    name: "",
    email: "",
    content: "",
  });

  // Auto-fill name and email when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      setReplyFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/comments?postId=${postId}&includeReplies=true`
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();

      // Separate parent comments and replies
      const parentComments = data.filter((c: Comment) => !c.parentId);
      const replyMap: Record<string, Comment[]> = {};

      data.forEach((comment: Comment) => {
        if (comment.parentId) {
          if (!replyMap[comment.parentId]) {
            replyMap[comment.parentId] = [];
          }
          replyMap[comment.parentId].push(comment);
        }
      });

      setComments(parentComments);
      setReplies(replyMap);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.content) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: formData.name,
          authorEmail: formData.email,
          content: formData.content,
          postId: postId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post comment");
      }

      toast.success("Comment posted successfully!");
      setFormData({ name: "", email: "", content: "" });
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyFormData.name || !replyFormData.email || !replyFormData.content) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: replyFormData.name,
          authorEmail: replyFormData.email,
          content: replyFormData.content,
          postId: postId,
          parentId: parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post reply");
      }

      toast.success("Reply posted successfully!");
      setReplyFormData({ name: "", email: "", content: "" });
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
    });
  };

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Komentar ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          Tulis Komentar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nama Anda"
              required
              disabled={isAuthenticated}
              className={isAuthenticated ? "bg-slate-100 dark:bg-slate-800" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              required
              disabled={isAuthenticated}
              className={isAuthenticated ? "bg-slate-100 dark:bg-slate-800" : ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Komentar *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Tulis komentar Anda..."
            rows={4}
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <MessageSquare className="h-4 w-4 mr-2" />
          Kirim Komentar
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {comment.authorName}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Balas
                </Button>
              </div>

              {/* Comment Content */}
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Replies */}
              {replies[comment.id] && replies[comment.id].length > 0 && (
                <div className="mt-4 ml-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                  {replies[comment.id].map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-white dark:bg-slate-900 rounded-lg p-4"
                    >
                      <div className="mb-2">
                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {reply.authorName}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(reply.createdAt)}
                        </p>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-6 p-4 bg-white dark:bg-slate-900 rounded-lg space-y-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Balas ke {comment.authorName}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`reply-name-${comment.id}`}>Nama</Label>
                      <Input
                        id={`reply-name-${comment.id}`}
                        value={replyFormData.name}
                        onChange={(e) =>
                          setReplyFormData({
                            ...replyFormData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Nama Anda"
                        disabled={isAuthenticated}
                        className={isAuthenticated ? "bg-slate-100 dark:bg-slate-800" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`reply-email-${comment.id}`}>
                        Email
                      </Label>
                      <Input
                        id={`reply-email-${comment.id}`}
                        type="email"
                        value={replyFormData.email}
                        onChange={(e) =>
                          setReplyFormData({
                            ...replyFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                        disabled={isAuthenticated}
                        className={isAuthenticated ? "bg-slate-100 dark:bg-slate-800" : ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`reply-content-${comment.id}`}>
                      Balasan
                    </Label>
                    <Textarea
                      id={`reply-content-${comment.id}`}
                      value={replyFormData.content}
                      onChange={(e) =>
                        setReplyFormData({
                          ...replyFormData,
                          content: e.target.value,
                        })
                      }
                      placeholder="Tulis balasan..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={isSubmitting}
                      size="sm"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Kirim Balasan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyFormData({ name: "", email: "", content: "" });
                      }}
                      size="sm"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
