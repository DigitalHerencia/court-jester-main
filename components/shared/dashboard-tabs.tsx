// components/shared/dashboard-tabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";

interface TabItem {
  label: string;
  href: string;
  count?: number | string;
}

interface DashboardTabsProps {
  role: "admin" | "offender";
  offenderId?: number;
}

export function DashboardTabs({ role, offenderId }: DashboardTabsProps) {
  const pathname = usePathname();

  const tabs: TabItem[] =
    role === "admin"
      ? [
          { label: "Notifications", href: "/admin/dashboard/notifications" },
          { label: "Offenders", href: "/admin/dashboard/offenders" },
          { label: "Cases", href: "/admin/dashboard/cases" },
          { label: "Motions", href: "/admin/dashboard/motions" },
          { label: "Settings", href: "/admin/dashboard/settings" },
          { label: "Tools", href: "/admin/dashboard/tools" },
        ]
      : offenderId
        ? [
            { label: "Profile", href: `/offender/dashboard/${offenderId}/profile` },
            { label: "Cases", href: `/offender/dashboard/${offenderId}/cases` },
            { label: "Court Dates", href: `/offender/dashboard/${offenderId}/court-dates` },
            { label: "Settings", href: `/offender/dashboard/${offenderId}/settings` },
          ]
        : [];

  return (
    <div className="mb-4">
      <div className="flex w-full rounded-md border-2 border-border overflow-hidden">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex-1 px-4 py-2 text-center transition-colors font-kings",
              pathname === tab.href || pathname.startsWith(tab.href.replace(/\/$/, ""))
                ? "font-medium bg-background text-foreground"
                : "bg-foreground text-background hover:bg-background hover:opacity-90"
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
    </div>
  );
}
