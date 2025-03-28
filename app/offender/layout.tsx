import type React from "react"

export default function OffenderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="mx-auto max-w-7xl p-2">{children}</div>
}

