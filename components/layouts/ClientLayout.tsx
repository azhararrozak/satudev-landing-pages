"use client"

import { ReactNode } from "react"
import { LanguageProvider } from "@/components/providers/LanguageProvider"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
