import { redirect } from "next/navigation"

export default function OldAdminDashboardRedirect() {
  // Redirect to new admin dashboard
  redirect("/admin/dashboard")
}

