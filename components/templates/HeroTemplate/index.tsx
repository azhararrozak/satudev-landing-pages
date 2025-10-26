"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroTemplate() {
  const { t } = useLanguage()
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleReset = () => {
      setKey(prev => prev + 1);
    };

    window.addEventListener('hero-reset', handleReset);
    return () => window.removeEventListener('hero-reset', handleReset);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const handleGetStarted = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const headerOffset = 80;
      const elementPosition = contactSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.section
      id="home"
      key={key}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-primary/5 to-background"
    >
      <div className="px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <motion.div variants={itemVariants} className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {t("hero.title")}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {t("hero.cta")}
              </Button>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <Image
                src="/hero-code.webp"
                alt="Hero Image - Software Development"
                fill
                className="object-cover rounded-lg shadow-xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
