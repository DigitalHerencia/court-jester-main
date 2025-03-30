import { redirect } from "next/navigation"

export default function AdminDashboardPage() {
  // Redirect to notifications tab
  redirect("/admin/dashboard/notifications")
}

