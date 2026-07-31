"use client"

/**
 * Projects page
 * - Fetches project cards dynamically from API `/api/projects`
 * - Filter by category using the select control ("all" shows all projects)
 * - Pagination with configurable items per page (PER_PAGE constant)
 */

import React, { useEffect, useMemo, useState } from "react"
import ProjectCard from "../../components/organisms/ProjectCard"
import { paginate } from "../../lib/utils"
import { useLanguage } from "@/components/providers/LanguageProvider"

type Project = {
  id?: string
  title: string
  description: string
  image?: string
  category?: string
  tech?: string[]
}

const PER_PAGE = 6

export default function ProjectPages() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [page, setPage] = useState<number>(1)
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) throw new Error("Failed to fetch projects")
        const data = await res.json()

        if (Array.isArray(data.projects)) {
          const mapped: Project[] = data.projects.map(
            (p: {
              id?: string
              title: string
              description: string
              image?: string | null
              category?: string | null
              tech?: string[] | null
            }) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              image: p.image || undefined,
              category: p.category || undefined,
              tech: Array.isArray(p.tech) ? p.tech : undefined,
            })
          )
          setProjectsData(mapped)
        }
      } catch (err) {
        console.error("Error loading projects from DB:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    projectsData.forEach((p) => p.category && set.add(p.category))
    return ["all", ...Array.from(set)]
  }, [projectsData])

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return projectsData
    return projectsData.filter((p) => p.category === selectedCategory)
  }, [selectedCategory, projectsData])

  const pageData = useMemo(() => paginate(filtered, page, PER_PAGE), [filtered, page])

  function goToPage(n: number) {
    const next = Math.min(Math.max(1, n), pageData.totalPages || 1)
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("projects.title")}</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">{t("projects.category")}</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
            className="border rounded px-2 py-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? t("projects.categoryAll") : c}
              </option>
            ))}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-2"></div>
          Loading projects...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageData.items.length === 0 ? (
              <p className="col-span-full py-8 text-center text-gray-500">
                No projects found.
              </p>
            ) : (
              pageData.items.map((p: Project, idx: number) => (
                <ProjectCard key={p.id || `${p.title}-${idx}`} project={p} />
              ))
            )}
          </section>

          {pageData.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={pageData.current === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                {t("projects.prev")}
              </button>

              {Array.from({ length: pageData.totalPages }).map((_, i) => {
                const n = i + 1
                return (
                  <button
                    key={n}
                    onClick={() => goToPage(n)}
                    className={`px-3 py-1 border rounded ${pageData.current === n ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900" : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"}`}>
                    {n}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={pageData.current === pageData.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                {t("projects.next")}
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}
