import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import { ToastProvider } from "@/components/shared/toast-provider"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${jacquard.variable} ${kings.variable}`} lang="es">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}



