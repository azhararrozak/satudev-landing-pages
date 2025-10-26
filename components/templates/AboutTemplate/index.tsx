"use client"

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion } from 'framer-motion'

export default function AboutTemplate() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="grid gap-6 lg:grid-cols-2 lg:gap-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div className="flex flex-col justify-center space-y-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
                    {t("about.badge")}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    {t("about.title")}
                  </h2>
                  <p className="text-muted-foreground md:text-xl/relaxed">
                    {t("about.description")}
                  </p>
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-4">
                  <p className="text-muted-foreground">
                    {t("about.history")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("about.believe")}
                  </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4 w-full md:w-auto justify-between">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">5+</h3>
                    <p className="text-sm text-muted-foreground">{t("about.projectsCompleted")}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">4+</h3>
                    <p className="text-sm text-muted-foreground">{t("about.teamMembers")}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">2+</h3>
                    <p className="text-sm text-muted-foreground">{t("about.yearsExperience")}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">10+</h3>
                    <p className="text-sm text-muted-foreground">{t("about.clientsServed")}</p>
                  </div>
                </motion.div>
              </div>
              <motion.div variants={itemVariants} className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-square">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
                    alt="Team Photo"
                    fill
                    className="object-cover rounded-lg shadow-xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
  )
}
