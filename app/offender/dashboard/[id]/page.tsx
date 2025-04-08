// app/offender/dashboard/[id]/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function OffenderDashboardRedirect() {
  const token = ( await cookies() ).get("token")?.value;

  if (!token) {
    console.warn("Dashboard redirect failed - no token found");
    redirect("/");
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== "offender" || !payload.offenderId) {
    console.warn("Invalid offender token during redirect");
    redirect("/");
  }

  redirect(`/offender/dashboard/${payload.offenderId}/profile`);
}
