"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import projects from "@/data/PortofolioData";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function PortofolioTemplate() {
  const categories = [
    { id: "all", label: "All Projects" },
    { id: "mobile", label: "Mobile" },
    { id: "web", label: "Web" },
    { id: "software", label: "Custom App" },
  ];

  const [projectsList] = useState(projects);

  return (
    <section id="portfolio" className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
              Our Work
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Featured Projects
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Explore our portfolio of successful projects and ongoing
              developments.
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
                {projectsList
                  .filter(
                    (project) =>
                      category.id === "all" || project.category === category.id
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
        <div className="mt-10 flex justify-center">
            <Link href={"/projects"} className="rounded-lg border-2 px-4 dark:border-white text-gray-600 py-2 font-bold">
            View All Projects
            </Link>
        </div>
      </div>
    </section>
  );
}
