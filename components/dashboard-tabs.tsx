"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardTabsProps {
  offenderId: string
}

export default function DashboardTabs({ offenderId }: DashboardTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { name: "Dashboard", href: `/offender/dashboard/${offenderId}` },
    { name: "Profile", href: `/offender/dashboard/${offenderId}/profile` },
    { name: "Cases", href: `/offender/dashboard/${offenderId}/cases` },
    { name: "Court Dates", href: `/offender/dashboard/${offenderId}/court-dates` },
    { name: "Motions", href: `/offender/dashboard/${offenderId}/motions` },
    { name: "Settings", href: `/offender/dashboard/${offenderId}/settings` },
  ]

  return (
    <div className="mb-6 border-b border-foreground/10">
      <nav className="-mb-px flex space-x-4 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground/60 hover:border-foreground/30 hover:text-foreground/80",
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

