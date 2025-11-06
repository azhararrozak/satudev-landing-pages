import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.satudev.id"),
  title: {
    default: "Satudev — Jasa Pembuatan Website & Mobile App Profesional",
    template: "%s | Satudev"
  },
  description:
    "Satudev adalah layanan profesional pembuatan website, mobile app, dan sistem custom. Cocok untuk UMKM, sekolah, bisnis, dan instansi. Harga terjangkau, desain modern, cepat, dan aman.",
  keywords: [
    "jasa pembuatan website",
    "jasa bikin website",
    "jasa website profesional",
    "jasa pembuatan aplikasi",
    "jasa pembuatan mobile app",
    "bikin aplikasi android",
    "bikin website perusahaan",
    "jasa web developer",
    "jasa developer",
    "pembuatan sistem custom"
  ],
  alternates: {
    canonical: "https://www.satudev.id"
  },
  openGraph: {
    type: "website",
    url: "https://www.satudev.id",
    title: "Satudev — Jasa Pembuatan Website & Mobile App Profesional",
    description:
      "Layanan pembuatan website & mobile app untuk bisnis, sekolah, dan UMKM. Cepat, aman, modern, dan dapat disesuaikan dengan kebutuhan Anda.",
    siteName: "Satudev",
    images: [
      {
        url: "https://www.satudev.id/SatuDev.png",
        width: 1200,
        height: 630,
        alt: "Satudev — Layanan Pembuatan Website & Aplikasi"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Satudev — Jasa Pembuatan Website & Mobile App Profesional",
    description:
      "Pembuatan website dan mobile app yang cepat, aman, dan terjangkau. Cocok untuk UMKM, sekolah, dan bisnis.",
    images: ["https://www.satudev.id/SatuDev.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Satudev",
    url: "https://www.satudev.id",
    logo: "https://www.satudev.id/SatuDev.png",
    description:
      "Satudev menyediakan jasa pembuatan website, mobile app, dan sistem custom dengan harga terjangkau dan kualitas profesional.",
    sameAs: [
      "https://www.instagram.com/satudev.solution",
      "https://www.tiktok.com/@satudev_solution"
    ]
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          type="application/ld+json"
          id="satudev-org"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
