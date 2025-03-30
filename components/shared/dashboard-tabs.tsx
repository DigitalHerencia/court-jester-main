"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";

interface TabItem {
  label: string;
  href: string;
  count?: number;
}

interface DashboardTabsProps {
  role: "admin" | "offender";
  offenderId?: string;
}

export function DashboardTabs({ role, offenderId }: DashboardTabsProps) {
  const pathname = usePathname();

  // Define tabs based on role; if offenderId is undefined, the offender-specific tabs won't work correctly.
  const tabs: TabItem[] =
    role === "admin"
      ? [
          { label: "Notifications", href: "/admin/dashboard/notifications", count: 3 },
          { label: "Offenders", href: "/admin/dashboard/offenders" },
          { label: "Cases", href: "/admin/dashboard/cases" },
          { label: "Motions", href: "/admin/dashboard/motions" },
          { label: "Database", href: "/admin/dashboard/tools/database-reset" },
          { label: "Settings", href: "/admin/dashboard/settings" },
          { label: "Tools", href: "/admin/dashboard/tools" },
        ]
      : [
          { label: "Profile", href: `/offender/dashboard/${offenderId}/profile` },
          { label: "Cases", href: `/offender/dashboard/${offenderId}/cases` },
          { label: "Court Dates", href: `/offender/dashboard/${offenderId}/court-dates` },
          { label: "Settings", href: `/offender/dashboard/${offenderId}/settings` },
        ];

  return (
    <div className="mb-4 border-b border-foreground/20">
      <nav className="-mb-px flex space-x-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            className={cn(
              "inline-flex whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
              pathname === tab.href
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground/60 hover:border-foreground/40 hover:text-foreground/80"
            )}
            href={tab.href}
          >
            {tab.label}
            {tab.count && (
              <span className="ml-2 rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
