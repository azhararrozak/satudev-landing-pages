"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { translations, TranslationKey } from "@/data/translations"

type Language = "en" | "id"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

// Detect browser/system language
function detectLanguageClient(): Language {
  // cek localStorage dulu
  const stored = localStorage.getItem("language");
  if (stored === "en" || stored === "id") return stored;

  // deteksi dari browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("id") || browserLang.includes("indonesia")) return "id";

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.includes("Jakarta") || timeZone.includes("Asia/Jakarta")) return "id";
  } catch {}

  return "en";
}

type LanguageProviderProps = { children: ReactNode };

export function LanguageProvider({ children }: LanguageProviderProps) {
  // gunakan lazy initializer agar aman di SSR (window undefined di server)
  const [language, setLanguageState] = useState<Language>(() => "en");

  // setelah mount di client, sinkronkan preferensi nyata
  useEffect(() => {
    const detected = detectLanguageClient();
    setLanguageState(detected);
    document.documentElement.lang = detected;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key: TranslationKey): string => {
    // beri fallback aman jika key/locale tidak ada
    return translations?.[language]?.[key] ?? key;
  };

  // PENTING: SELALU render Provider, jangan pernah return children tanpa Provider
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
