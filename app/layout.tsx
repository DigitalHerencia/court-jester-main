import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import { ToastProvider } from "@/components/toast-provider"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jacquard.variable} ${kings.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jacquard+24+Charted&family=Kings&display=swap"
          rel="stylesheet"
        />
        {/* Use a data URL for the favicon to avoid 404 */}
        <link
          rel="icon"
          href="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/favicon-1K7OJP0Tf7FPpKDkgC7ljht44PVI1X.ico"
        />
      </head>
      <body className="mx-auto max-w-7xl p-2 font-kings">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}



