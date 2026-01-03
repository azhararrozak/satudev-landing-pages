"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import CommentSection from "@/components/blog/CommentSection";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  publishedAt: Date | null;
  categoryName: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

type PostTag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function BlogDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const resolvedParams = await params;
      const slug = resolvedParams.slug;
      
      try {
        // Fetch all published posts and find by slug
        const response = await fetch("/api/posts?status=published");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        
        // Handle both old format (array) and new format (object with posts array)
        const postsList = Array.isArray(data) ? data : data.posts || [];
        const foundPost = postsList.find((p: Post) => p.slug === slug);
        
        if (foundPost) {
          setPost(foundPost);
          // Fetch tags for this post
          try {
            const tagsResponse = await fetch(`/api/posts/${foundPost.id}/tags`);
            if (tagsResponse.ok) {
              const tagsData = await tagsResponse.json();
              setTags(tagsData);
            }
          } catch (error) {
            console.error("Error fetching tags:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [params]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-32">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <article className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/blog")}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Blog
          </Button>

          {post.categoryName && (
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                <Tag className="h-4 w-4 mr-2" />
                {post.categoryName}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Tags:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.featuredImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-lg prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100
              prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Bagikan Artikel
            </h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  const text = post.title;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      text
                    )}&url=${encodeURIComponent(url)}`,
                    "_blank"
                  );
                }}
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      url
                    )}`,
                    "_blank"
                  );
                }}
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  const text = post.title;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      text + " " + url
                    )}`,
                    "_blank"
                  );
                }}
              >
                WhatsApp
              </Button>
            </div>
          </div>

          {post && <CommentSection postId={post.id} />}
        </div>
      </article>

      <Footer />
    </main>
  );
}
