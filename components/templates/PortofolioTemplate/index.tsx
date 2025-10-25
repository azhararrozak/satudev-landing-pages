"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { usePortfolio } from "@/data/PortofolioData";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PortofolioTemplate() {
  const { t } = useLanguage()
  const categories = [
    { id: "all", label: t("portfolio.viewAll") },
    { id: "mobile", label: t("portfolio.category.mobile") },
    { id: "web", label: t("portfolio.category.web") },
    { id: "software", label: t("portfolio.category.CustomApp") },
  ];

  const projects = usePortfolio();

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
              <div className="grid gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3">
                {projects
                  .filter((project) =>
                    category.id === "all"
                      ? true
                      : project.category === category.id
                  )
                  .map((project, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-lg border"
                    >
                      <div className="aspect-video overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          width={600}
                          height={400}
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.tech.map((tech, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-10 flex justify-center dark:text-white">
            <Link href={"/projects"} className="rounded-lg border-2 px-4 dark:border-white text-gray-600 dark:text-white py-2 font-bold">
            {t("portfolio.viewAll")}
            </Link>
        </div>
      </div>
    </section>
  );
}
