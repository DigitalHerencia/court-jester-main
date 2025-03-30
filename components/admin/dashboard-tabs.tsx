"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/utils"

interface TabItem {
  label: string
  href: string
  count?: number
}

export function AdminDashboardTabs() {
  const pathname = usePathname()

  // Update the tabs to match the requested structure
  const tabs: TabItem[] = [
    { label: "Notifications", href: "/admin/dashboard/notifications", count: 3 },
    { label: "Offenders", href: "/admin/dashboard/offenders" },
    { label: "Cases", href: "/admin/dashboard/cases" },
    { label: "Motions", href: "/admin/dashboard/motions" },
    { label: "Database", href: "/admin/dashboard/database" },
    { label: "Settings", href: "/admin/dashboard/settings" },
    { label: "Tools", href: "/admin/dashboard/tools" },
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
            {tab.count && <span className="ml-2 rounded-full bg-foreground/10 px-2 py-0.5 text-xs">{tab.count}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}

