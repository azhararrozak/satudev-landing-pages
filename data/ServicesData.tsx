"use client";

import { Smartphone, Globe, Code } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export const useServices = () => {
  const { t } = useLanguage();
  
  return [
    {
      title: t("services.mobileDev.title"),
      description:
      t("services.mobileDev.desc"),
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      features: [
        t("services.mobileDev.list1"),
        t("services.mobileDev.list2"),
        t("services.mobileDev.list3"),
      ],
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: t("services.webDev.title"),
      description:
        t("services.webDev.desc"),
      icon: <Globe className="h-12 w-12 text-primary" />,
      features: [
        t("services.webDev.list1"),
        t("services.webDev.list2"),
        t("services.webDev.list3"),
      ],
      image:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
    },
    {
      title: t("services.customApp.title"),
      description:
        t("services.customApp.desc"),
      icon: <Code className="h-12 w-12 text-primary" />,
      features: [
        t("services.customApp.list1"),
        t("services.customApp.list2"),
        t("services.customApp.list3"),
      ],
      image:
        "https://images.unsplash.com/photo-1623282033815-40b05d96c903?q=80&w=2070&auto=format&fit=crop",
    },
  ];
};