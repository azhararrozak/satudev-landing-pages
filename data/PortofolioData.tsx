"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export const usePortfolio = () => {
  const { t } = useLanguage();
  return [
    {
      title: t("portfolio.projects.examSafe.title"),
      description: t("portfolio.projects.examSafe.desc"),
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1470&auto=format&fit=crop",
      category: "mobile",
      tech: ["React Native", "Node.js"],
    },
    {
      title: t("portfolio.projects.komiteQR.title"),
      description: t("portfolio.projects.komiteQR.desc"),
      image: "/project-komite-qr.webp",
      category: "web",
      tech: ["Mongo", "Express", "React", "Node.js"],
    },
  ];
};
