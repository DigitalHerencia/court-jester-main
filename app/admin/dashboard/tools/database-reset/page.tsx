import { redirect } from "next/navigation"

export default function DatabaseResetRedirectPage() {
  // Redirect to admin tools page
  redirect("/dashboard/admin/tools")
}

