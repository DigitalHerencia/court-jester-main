import { redirect } from "next/navigation"

export default function OffenderDashboardPage({ params }: { params: { id: string } }) {
  // Redirect to profile tab
  redirect(`/offender/dashboard/${params.id}/profile`)
}

