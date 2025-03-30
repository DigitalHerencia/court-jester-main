import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
}

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${jacquard.variable} ${kings.variable}`} lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/favicon-1K7OJP0Tf7FPpKDkgC7ljht44PVI1X.ico"
          rel="icon"
        />
      </head>
      <body className="font-kings">{children}</body>
    </html>
  )
}