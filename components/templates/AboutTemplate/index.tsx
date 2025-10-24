"use client"

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function AboutTemplate() {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
                    {t("about.badge")}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    {t("about.title")}
                  </h2>
                  <p className="text-muted-foreground md:text-xl/relaxed">
                    {t("about.description")}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t("about.history")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("about.believe")}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">10+</h3>
                    <p className="text-sm text-muted-foreground">Projects Completed</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">2+</h3>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">3</h3>
                    <p className="text-sm text-muted-foreground">Countries Served</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold">20+</h3>
                    <p className="text-sm text-muted-foreground">Clients Served</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-square">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
                    alt="Team Photo"
                    fill
                    className="object-cover rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
  )
}
