"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: string;
  publishedAt: Date | null;
  categoryName: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });

  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?page=${page}&limit=${POSTS_PER_PAGE}&status=published&sort=desc`
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      
      // If API returns paginated data
      if (data.posts && data.meta) {
        setPosts(data.posts);
        setMeta(data.meta);
      } else {
        // If API returns array directly, filter published only
        const publishedPosts = data.filter((post: Post) => post.status === "published");
        const sortedPosts = publishedPosts.sort(
          (a: Post, b: Post) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Manual pagination
        const startIndex = (page - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
        
        setPosts(paginatedPosts);
        setMeta({
          total: sortedPosts.length,
          page: page,
          limit: POSTS_PER_PAGE,
          totalPages: Math.ceil(sortedPosts.length / POSTS_PER_PAGE),
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getSummary = (content: string, maxLength: number = 150) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Blog & Artikel
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Temukan artikel, tips, dan insight terbaru seputar pengembangan web,
            mobile app, dan teknologi
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Belum ada artikel yang dipublikasikan
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <article className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                      {/* Featured Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold opacity-20">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Category & Date */}
                        <div className="flex items-center justify-between mb-3 text-sm">
                          {post.categoryName && (
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                              {post.categoryName}
                            </span>
                          )}
                          <div className="flex items-center text-slate-500 dark:text-slate-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-xs">
                              {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Excerpt/Summary */}
                        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 flex-1">
                          {post.excerpt || getSummary(post.content)}
                        </p>

                        {/* Read More */}
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                          <span>Baca Selengkapnya</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {[...Array(meta.totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === meta.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className={
                              currentPage === page
                                ? ""
                                : "dark:bg-slate-800 dark:border-slate-700"
                            }
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-slate-500 dark:text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === meta.totalPages}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Page Info */}
              <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
                Menampilkan {posts.length} dari {meta.total} artikel
              </p>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
