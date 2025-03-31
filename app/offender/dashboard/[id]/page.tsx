import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export default async function OffenderDashboardRedirect() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) {
    redirect("/")
  }
  const payload = await verifyToken(token)
  if (!payload || payload.role !== "offender") {
    redirect("/")
  }
  // Redirect to the profile page using the inmate number from the token
  redirect(`/offender/dashboard/${payload.offenderId}/profile`)
}

