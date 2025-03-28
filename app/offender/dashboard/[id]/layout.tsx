import type React from "react"
import { DashboardTabs } from "@/components/shared/dashboard-tabs"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { notFound } from "next/navigation"

export default function OffenderDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  // If no ID is provided, return 404
  if (!params.id) {
    notFound()
  }

  return (
    <>
      <DashboardHeader />
      <DashboardTabs role="offender" offenderId={params.id} />
      <main className="mt-2">{children}</main>
    </>
  )
}

