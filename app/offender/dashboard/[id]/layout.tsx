import { DashboardHeader } from "@/components/shared/dashboard-header"
import { DashboardTabs } from "@/components/shared/dashboard-tabs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import type React from "react"

export default async function OffenderDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) {
    redirect("/")
  }
  const payload = await verifyToken(token)
  if (!payload || payload.role !== "offender") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 bg-background text-foreground">
      {/* Header and tabs with styling matching the admin dashboard */}
      <DashboardHeader />
      <DashboardTabs offenderId={String(payload.offenderId)} role="offender" />
      <div className="space-y-4 h-[calc(100vh-180px)] overflow-y-auto hide-scrollbar">{children}</div>
    </div>
  )
}
