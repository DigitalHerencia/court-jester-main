"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/utils"

interface TabItem {
  label: string
  href: string
  count?: number
}

export function OffenderDashboardTabs({ offenderId }: { offenderId: string }) {
  const pathname = usePathname()

  // Create tabs for the offender dashboard
  const tabs: TabItem[] = [
    { label: "Profile", href: `/offender/dashboard/${offenderId}/profile` },
    { label: "Cases", href: `/offender/dashboard/${offenderId}/cases` },
    { label: "Court Dates", href: `/offender/dashboard/${offenderId}/court-dates` },
    { label: "Settings", href: `/offender/dashboard/${offenderId}/settings` },
  ]

  return (
    <div className="mb-4 border-b border-foreground/20">
      <nav className="-mb-px flex space-x-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
              pathname === tab.href
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground/60 hover:border-foreground/40 hover:text-foreground/80",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

