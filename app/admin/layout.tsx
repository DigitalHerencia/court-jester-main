import type React from "react"
import "@/app/globals.css"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="mx-auto max-w-7xl p-2">{children}</div>
}

