import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${jacquard.variable} ${kings.variable}`} lang="en">
      <head>
      </head>
      <body className="font-kings hide-scrollbar">{children}</body>
    </html>
  )
}

