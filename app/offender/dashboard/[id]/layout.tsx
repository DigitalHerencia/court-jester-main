// app/offender/dashboard/[id]/layout.tsx
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardTabs } from "@/components/shared/dashboard-tabs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function OffenderDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/");
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "offender") {
    redirect("/");
  }
  // Pass the offender id (which is now the inmate number) from the token to DashboardTabs
  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <DashboardHeader />
      <DashboardTabs offenderId={String(payload.offenderId)} role="offender" />
      {children}
    </div>
  );
}
