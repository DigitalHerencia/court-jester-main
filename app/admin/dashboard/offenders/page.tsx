"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface OffenderItem {
  id: number
  inmate_number: string
  first_name: string
  middle_name: string
  last_name: string
  status: string
  facility: string
}

export default function OffendersPage() {
  const [offenders, setOffenders] = useState<OffenderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOffenders() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch("/api/admin/offenders")
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`)
        }
        const data = await res.json()
        setOffenders(data.offenders || [])
      } catch (err) {
        console.error(err)
        setError("Failed to load offenders")
        toast.error("Failed to load offenders")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOffenders()
  }, [])

    
  return (
    <div className="card-secondary space-y-4 p-4">
      <h2 className="font-kings text-background text-3xl">Offender List</h2>
      <p className="font-kings text-background mb-2 text-sm">
        Manage all offenders in the system.
      </p>
      {isLoading ? (
        <p className="text-center py-4 text-background">Loading offenders...</p>
      ) : error ? (
        <p className="text-center py-4 text-red-500">{error}</p>
      ) : offenders.length === 0 ? (
        <p className="text-center py-4 text-background">No offenders found.</p>
      ) : (
        <div className="space-y-2">
          {offenders.map((offender) => (
            <div
              key={offender.id}
              className="card-content hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-lg">{offender.first_name} {offender.middle_name} {offender.last_name}</h3>
                <p className="text-sm">
                  <span className="font-medium">Number:</span> {offender.inmate_number}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span> {offender.status}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Facility:</span> {offender.facility}
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Link href={`/admin/dashboard/offenders/${offender.id}`}>
                  <Button className="button-link" variant="outline">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
