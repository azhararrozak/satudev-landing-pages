"use client"

import React from 'react'
import { Mail, Phone, MapPin, Instagram } from 'lucide-react'
import Link from 'next/link'
import FormContact from '@/components/organisms/FormContact'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function ContactTemplate() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
                  {t("contact.badge")}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{t("contact.title")}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  {t("contact.subtitle")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t("contact.form.email")}</h3>
                    <p className="text-muted-foreground">satudev.solution@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t("contact.phone")}</h3>
                    <p className="text-muted-foreground">(+62) 82241986504 </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{t("contact.office")}</h3>
                    <p className="text-muted-foreground">Jalan Pagenjahan, Adiwerna, Tegal</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold mb-2">{t("contact.followUs")}</h3>
                  <div className="flex gap-4">
                    <Link href="https://www.instagram.com/satudev.solution/" className="text-muted-foreground hover:text-primary">
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-lg">
                <FormContact />
              </div>
            </div>
          </div>
        </section>
  )
}
