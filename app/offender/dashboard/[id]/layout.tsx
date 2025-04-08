// app/offender/dashboard/[id]/layout.tsx
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardTabs } from "@/components/shared/dashboard-tabs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import type React from "react";

export default async function OffenderDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = ( await cookieStore ).get("token")?.value;

  if (!token) {
    console.warn("Dashboard layout load failed - No token found");
    redirect("/");
  }

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "offender" || !payload.offenderId) {
    console.warn("Invalid offender token payload in layout");
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 bg-background text-foreground">
      <DashboardHeader />
      <DashboardTabs offenderId={payload.offenderId} role="offender" />
      <div className="space-y-4 h-[calc(100vh-180px)] overflow-y-auto hide-scrollbar">
        {children}
      </div>
    </div>
  );
}
