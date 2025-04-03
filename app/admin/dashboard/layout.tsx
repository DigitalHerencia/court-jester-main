import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { DashboardTabs } from "@/components/shared/dashboard-tabs"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Check admin auth token
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) {
    redirect("/")
  }
  const payload = await verifyToken(token)
  if (!payload || payload.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 bg-background text-foreground hide-scrollbar">
      {/* Header and tabs with updated styling */}
      <DashboardHeader />
      <DashboardTabs role="admin" />
      <div className="space-y-4 h-[calc(100vh-180px)] overflow-y-auto hide-scrollbar">{children}</div>
    </div>
  )
}

