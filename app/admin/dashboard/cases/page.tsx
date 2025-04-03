"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface CaseItem {
  offender_name: ReactNode
  status: ReactNode
  next_hearing: any
  id: number
  case_number: string
  // Add any other fields needed, e.g. offender_name, status, etc.
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch("/api/admin/cases")
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`)
        }
        const data = await res.json()
        setCases(data.cases || [])
      } catch (err) {
        console.error(err)
        setError("Failed to load cases")
        toast.error("Failed to load cases")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCases()
  }, [])

  return (
    <div className="space-y-2">
      {/* Main content block */}
      <div className="card-secondary">
        <h3 className="font-kings text-3xl  ">Case List</h3>
        <p className="font-kings text-background mb-2 text-sm">Manage all cases in the system.</p>
          {isLoading ? (
            <p className="text-center py-4">Loading cases...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">{error}</p>
          ) : cases.length === 0 ? (
            <p className="text-center py-4">No cases found.</p>
          ) : (
            <div className="card-secondary space-y-2">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="card-content hover:shadow-md transition-shadow"
                >
                  <p>Case #{caseItem.case_number}</p>
                  <p>Offender: {caseItem.offender_name}</p>
                  <p>Status: {caseItem.status}</p>
                  <p>Next Hearing: {caseItem.next_hearing ? new Date(caseItem.next_hearing).toLocaleDateString() : "N/A"}</p>
                  <Link href={`/admin/dashboard/cases/${caseItem.id}`}>
                    <Button className="bg-foreground text-background hover:bg-foreground/90 mt-2">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

