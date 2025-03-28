"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface OffenderData {
  offender: {
    id: number
    inmate_number: string
    last_name: string
    first_name: string
    middle_name?: string
    status: string
    facility?: string
    age?: number
    height?: string
    weight?: number
    eye_color?: string
    hair?: string
    ethnicity?: string
    mugshot_url?: string
    created_at: string
  }
}

export default function OffenderProfilePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<OffenderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOffenderData()
  }, [params.id])

  function fetchOffenderData() {
    setIsLoading(true)
    setError(null)

    fetch(`/api/offenders/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Failed to fetch offender data: ${response.status} - ${text || response.statusText}`)
          })
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setError(null)
      })
      .catch((err) => {
        console.error("Error fetching offender data:", err)
        setError(err instanceof Error ? err.message : "Failed to load offender data")
        toast.error("Failed to load offender data")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleRetry = () => {
    fetchOffenderData()
  }

  if (isLoading) {
    return (
      <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
        <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
          <h2 className="font-kings mb-2 text-xl">My Profile</h2>
          <p>Loading profile data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
        <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
          <h2 className="font-kings mb-2 text-xl">My Profile</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <Button onClick={handleRetry} className="bg-background text-foreground hover:bg-background/90">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
        <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
          <h2 className="font-kings mb-2 text-xl">My Profile</h2>
          <p>No profile data available.</p>
        </div>
      </div>
    )
  }

  const { offender } = data

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <div className="flex flex-col md:flex-row gap-4">
          {offender.mugshot_url && (
            <div className="relative w-32 h-40 border-2 border-background flex-shrink-0">
              <Image
                src={offender.mugshot_url || "/placeholder.svg"}
                alt={`Mugshot of ${offender.first_name} ${offender.last_name}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div>
            <h2 className="font-kings mb-2 text-xl">
              {offender.first_name} {offender.middle_name ? `${offender.middle_name} ` : ""}
              {offender.last_name}
            </h2>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="text-sm">
                <span className="font-medium">Inmate Number:</span> {offender.inmate_number}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span> {offender.status || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Facility:</span> {offender.facility || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Age:</span> {offender.age || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Height:</span> {offender.height || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Weight:</span> {offender.weight || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Eye Color:</span> {offender.eye_color || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Hair:</span> {offender.hair || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Ethnicity:</span> {offender.ethnicity || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

