"use client"

import { usePathname } from "next/navigation"

export function DashboardHeader() {
  const pathname = usePathname()
  const isAdmin = pathname?.includes("/admin/")

  return (
    <header className="mb-2">
      <h1 className="font-jacquard text-4xl font-normal">{isAdmin ? "Admin Dashboard" : "Offender Dashboard"}</h1>
    </header>
  )
}

