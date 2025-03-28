"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
    <nav className="mb-2 w-full">
      <div className="flex w-full rounded-md border border-foreground">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex-1 px-4 py-2 text-center transition-colors",
              pathname === tab.href || pathname.startsWith(tab.href.replace(/\/$/, ""))
                ? "font-medium bg-background text-foreground"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}

