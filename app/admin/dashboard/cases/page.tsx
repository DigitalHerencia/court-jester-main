"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface CaseItem {
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
      {/* Title block */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Cases</h2>
        <p>Manage all cases in the system.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Case List</h3>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          {isLoading ? (
            <p className="text-center py-4">Loading cases...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">{error}</p>
          ) : cases.length === 0 ? (
            <p className="text-center py-4">No cases found.</p>
          ) : (
            <div className="space-y-2">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="rounded-md border border-background/20 p-2 bg-background text-foreground"
                >
                  <p>Case #{caseItem.case_number}</p>
                  {/* ...other case details here... */}
                  <Link href={`/admin/dashboard/cases/${caseItem.id}`}>
                    <Button className="bg-foreground text-background hover:bg-foreground/90 mt-2">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
