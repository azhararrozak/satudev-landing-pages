"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";

type Project = {
  id?: string;
  title: string;
  description: string;
  image?: string;
  category?: string;
  tech?: string[];
};

export default function PortofolioTemplate() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        if (Array.isArray(data.projects)) {
          const mapped: Project[] = data.projects.map(
            (p: {
              id?: string;
              title: string;
              description: string;
              image?: string | null;
              category?: string | null;
              tech?: string[] | null;
            }) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              image: p.image || "/placeholder.png",
              category: p.category || undefined,
              tech: Array.isArray(p.tech) ? p.tech : [],
            })
          );
          setProjects(mapped);
        }
      } catch (err) {
        console.error("Error fetching portfolio projects:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const categories = [
    { id: "all", label: t("portfolio.viewAll") },
    { id: "mobile", label: t("portfolio.category.mobile") },
    { id: "web", label: t("portfolio.category.web") },
    { id: "software", label: t("portfolio.category.CustomApp") },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section id="portfolio" className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
              {t("portfolio.badge")}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              {t("portfolio.title")}
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              {t("portfolio.subtitle")}
            </p>
          </div>
        </div>
        <Tabs defaultValue="all" className="w-full mt-6">
          <div className="flex justify-center mb-12">
            <TabsList className="border-2 ">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  Loading portfolio...
                </div>
              ) : (
                <motion.div
                  className="grid gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {projects
                    .filter((project) =>
                      category.id === "all"
                        ? true
                        : project.category?.toLowerCase() === category.id.toLowerCase()
                    )
                    .map((project, index) => (
                      <motion.div
                        key={project.id || index}
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-lg border bg-card"
                      >
                        <div className="aspect-video overflow-hidden relative bg-muted">
                          {project.image ? (
                            <Image
                              src={project.image}
                              alt={project.title}
                              width={600}
                              height={400}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                          {project.tech && project.tech.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {project.tech.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs text-primary font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-10 flex justify-center dark:text-white">
          <Link
            href={"/projects"}
            className="rounded-lg border-2 px-4 dark:border-white text-gray-600 dark:text-white py-2 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t("portfolio.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
