"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface OffenderItem {
  id: number
  inmate_number: string
  name: string
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
    <div className="space-y-2">
      {/* Main content block */}
      <div className="card-secondary">
        <h2 className="font-kings text-3xl">Offender List</h2>
        <p className="font-kings text-background mb-2 text-sm">Manage all offenders in the system.</p>
          {isLoading ? (
            <p className="text-center py-4">Loading offenders...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">{error}</p>
          ) : offenders.length === 0 ? (
            <p className="text-center py-4">No offenders found.</p>
          ) : (
            <div className="card-secondary space-y-2">
              {offenders.map((offender) => (
                <div
                  key={offender.id}
                  className="card-content hover:shadow-md transition-shadow"
                >
                    <div>
                      <h3>{offender.name}</h3>
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
                        <Button className="bg-foreground text-background hover:bg-foreground/90">View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
              ))}
              </div>
          )}
          </div>
        </div>
  )
}

