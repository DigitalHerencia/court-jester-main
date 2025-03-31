import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jacquard.variable} ${kings.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jacquard+24+Charted&family=Kings&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 fontSize=%2290%22>♠️</text></svg>"
        />
      </head>
      <body className="font-kings">{children}</body>
    </html>
  )
}

