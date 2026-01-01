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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Comments</h1>
          <p className="text-slate-600 mt-1">
            Manage and reply to blog comments
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {comments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No comments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {comment.authorName}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {comment.authorEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.postTitle && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            on: {comment.postTitle}
                          </span>
                          {comment.postSlug && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/blog/${comment.postSlug}`)
                              }
                              className="h-6 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                    <h4 className="font-medium text-slate-900">
                      Reply to {comment.authorName}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="replyName">Your Name</Label>
                        <Input
                          id="replyName"
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="replyEmail">Your Email</Label>
                        <Input
                          id="replyEmail"
                          type="email"
                          value={replyEmail}
                          onChange={(e) => setReplyEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="replyContent">Reply</Label>
                      <Textarea
                        id="replyContent"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleReply(comment.id, comment.postId)
                        }
                        disabled={isSubmitting}
                        size="sm"
                      >
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Post Reply
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                          setReplyName("");
                          setReplyEmail("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
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
