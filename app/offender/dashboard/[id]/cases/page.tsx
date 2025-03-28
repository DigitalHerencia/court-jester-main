"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface Case {
  id: number
  case_number: string
  court: string
  judge: string
  filing_date: string
  status: string
  charges: Array<{
    id: number
    count_number: number
    statute: string
    description: string
    class: string
  }>
  hearings: Array<{
    id: number
    hearing_date: string
    hearing_time: string
    hearing_type: string
    court_room: string
  }>
}

export default function OffenderCasesPage({ params }: { params: { id: string } }) {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/offenders/${params.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch cases: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setCases(data.cases || [])
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError(err instanceof Error ? err.message : "Failed to load cases")
        toast.error("Failed to load cases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [params.id])

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">My Cases</h2>
        <p>View your active and past cases.</p>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">Loading cases...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4 text-red-500">{error}</p>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">No cases found.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="rounded-md border border-background/20 p-2 bg-foreground text-background">
              <h3 className="font-kings mb-2 text-xl">Case #{caseItem.case_number}</h3>
              <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                  <p className="text-sm">
                    <span className="font-medium">Court:</span> {caseItem.court}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Judge:</span> {caseItem.judge}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Filing Date:</span>{" "}
                    {new Date(caseItem.filing_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {caseItem.status}
                  </p>
                </div>

                {caseItem.status === "Active" && (
                  <div className="flex justify-end mt-2">
                    <Link href={`/offender/dashboard/${params.id}/motions?caseId=${caseItem.id}`}>
                      <Button className="bg-foreground text-background hover:bg-foreground/90">View Motions</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

