import type React from "react"
import { DashboardTabs } from "@/components/shared/dashboard-tabs"
import { DashboardHeader } from "@/components/shared/dashboard-header"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DashboardHeader />
      <DashboardTabs role="admin" />
      <main className="mt-2">{children}</main>
    </>
  )
}

