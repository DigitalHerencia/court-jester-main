"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Offender {
  id: number
  inmate_number: string
  nmcd_number: string | null
  first_name: string
  last_name: string
  middle_name?: string
  status: string
  custody_status: string
  account_enabled: boolean
  profile_enabled: boolean
  facility?: string
  age?: number
  gender: string
  race: string
  ethnicity: string
  mugshot_url?: string
}

export default function OffenderProfilePage() {
  const { id } = useParams<{ id: string }>() // id is the inmate number (e.g. "468079")
  const [offender, setOffender] = useState<Offender | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function fetchOffenderData() {
      try {
        // Include credentials so the HTTP‑only token cookie is sent
        const res = await fetch(`/api/offenders/${id}/profile`, { credentials: "include" })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to fetch offender profile data")
        }
        // API returns the offender object directly.
        const data: Offender = await res.json()
        setOffender(data)
      } catch (err: unknown) {
        console.error("Error fetching offender profile data:", err)
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOffenderData()
  }, [id])

  const handlePrintProfile = () => {
    window.print()
    toast.success("Printing profile...")
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold font-kings text-background">Loading profile...</div>
          <div className="text-foreground/60">Please wait while we fetch your profile data.</div>
        </div>
      </div>
    )
  }

  if (error || !offender) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-destructive font-kings">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load profile data"}</div>
          <Button className="button-link" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="text-2xl font-bold font-kings text-background">Offender Profile</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mugshot and Basic Info */}
        <div className="card-content p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-40 w-32 border border-foreground/20 rounded-md overflow-hidden">
              {offender.mugshot_url ? (
                <Image
                  fill
                  alt="Mugshot"
                  src={offender.mugshot_url || "/placeholder.svg"}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  No mugshot available
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold font-kings text-foreground">
                {offender.last_name}, {offender.first_name} {offender.middle_name || ""}
              </h2>
              <p>
                <strong>Inmate #:</strong> {offender.inmate_number}
              </p>
              <p>
                <strong>Custody:</strong>{" "}
                {offender.custody_status === "in_custody" ? "In Custody" : "Released"}
              </p>
            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div className="card-content p-4">
          <h2 className="text-xl font-semibold font-kings text-foreground">Additional Information</h2>
          <p>
            <strong>Status:</strong> {offender.status}
          </p>
          <p>
            <strong>Facility:</strong> {offender.facility || "N/A"}
          </p>
          <p>
            <strong>Age:</strong> {offender.age ?? "N/A"}
          </p>
          <p>
            <strong>Gender:</strong> {offender.gender}
          </p>
          <p>
            <strong>Race:</strong> {offender.race}
          </p>
          <p>
            <strong>Ethnicity:</strong> {offender.ethnicity}
          </p>
        </div>
      </div>
      <Button className="font-kings button-link" variant="outline" onClick={handlePrintProfile}>
        Print Profile
      </Button>
    </div>
  )
}
