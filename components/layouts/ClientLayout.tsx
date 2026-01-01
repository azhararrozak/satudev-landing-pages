"use client"

import { ReactNode } from "react"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { Toaster } from "sonner"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Toaster position="top-right" richColors />
    </LanguageProvider>
  )
}
