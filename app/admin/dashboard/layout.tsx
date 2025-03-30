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
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      {/* Header and tabs with old styling */}
      <DashboardHeader />
      <DashboardTabs role="admin" />
      {children}
    </div>
  )
}
