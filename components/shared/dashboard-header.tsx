"use client"

import { usePathname } from "next/navigation"
import { Button } from "../ui/button"

// Client-side logout function
async function logout() {
  const res = await fetch("/api/auth/logout", { method: "GET" })
  if (res.ok) {
    window.location.href = "/"
  } else {
    console.error("Failed to logout")
  }
}


export function AdminDashboardHeader() {
  return (
    <header className="mb-2 flex items-center justify-between">
      <h1 className="font-jacquard text-4xl font-normal">Admin Dashboard</h1>
      <Button
        className="rounded-md border border-foreground/20 bg-background px-3 py-1 text-sm text-foreground hover:bg-foreground/10"
        onClick={logout}
      >
        Logout
      </Button>
    </header>
  )
}

export function OffenderDashboardHeader() {
  return (
    <header className="mb-2 flex items-center justify-between">
      <h1 className="font-jacquard text-4xl font-normal">Offender Dashboard</h1>
      <Button
        className="rounded-md border border-foreground/20 bg-background px-3 py-1 text-sm text-foreground hover:bg-foreground/10"
        onClick={logout}
      >
        Logout
      </Button>
    </header>
  )
}

export function DashboardHeader() {
  const pathname = usePathname()
  const isAdmin = pathname.includes("/admin/")

  return isAdmin ? <AdminDashboardHeader /> : <OffenderDashboardHeader />
}

