"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Check for dark mode preference
    if (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div>
            <Image src="/SatuDev.png" className="px-2" alt="SatuDev" width={60} height={60} />
            </div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SatuDev
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#services"
              className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
            >
              {t("nav.services")}
            </Link>
            <Link
              href="#portfolio"
              className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
            >
              {t("nav.portfolio")}
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
            >
              {t("nav.contact")}
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLanguage}
              title={language === "en" ? "Switch to Indonesian" : "Ganti ke Bahasa Inggris"}
            >
              <span className="text-xs font-bold">{language.toUpperCase()}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>

          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLanguage} 
              className="mr-2"
              title={language === "en" ? "Switch to Indonesian" : "Ganti ke Bahasa Inggris"}
            >
              <span className="text-xs font-bold">{language.toUpperCase()}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-slate-900">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center space-y-8 p-8 bg-white dark:bg-slate-900">
            <Link
              href="#services"
              className="text-lg font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.services")}
            </Link>
            <Link
              href="#portfolio"
              className="text-lg font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.portfolio")}
            </Link>
            <Link
              href="#about"
              className="text-lg font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.about")}
            </Link>
            <Link
              href="#contact"
              className="text-lg font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.contact")}
            </Link>
            <Button
              variant="default"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.getStarted")}
            </Button>
          </nav>
        </div>
      )}
      
    </header>
  );
}
