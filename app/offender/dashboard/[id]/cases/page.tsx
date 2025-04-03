"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Case {
  id: number
  case_number: string
  court: string
  judge: string
  filing_date: string
  case_type: string
  plaintiff: string
  defendant: string
  status: string
  next_date: string | null
  created_at: string
  updated_at: string
}

export default function OffenderCasesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch(`/api/offenders/${id}/cases`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to fetch cases")
        }
        const data = await res.json()
        setCases(data.cases || [])
      } catch (err: unknown) {
        console.error("Error fetching cases:", err)
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    if (id) {
      fetchCases()
    }
  }, [id])

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 text-background">
        Loading cases...
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center py-32 text-destructive">
        Error: {error}
      </div>
    )

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-2xl text-background mb-6">My Cases</h1>
      {cases.length === 0 ? (
        <div className="text-background">No cases found.</div>
      ) : (
        cases.map((c) => (
          <Card key={c.id} className="card-content mb-4">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-kings text-2xl text-foreground">
                Case #{c.case_number}
              </CardTitle>
              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  c.status === "Active"
                    ? "bg-[#34C759] text-[#1A202C]"
                    : "bg-[#FEE2E2] text-[#B91C1C]"
                }`}
              >
                {c.status === "Active" ? "Open" : "Closed"}
              </span>
            </CardHeader>
            <CardContent className="text-lg text-foreground">
              <p>
                <strong>Court:</strong> {c.court}
              </p>
              <p>
                <strong>Judge:</strong> {c.judge || "Not assigned"}
              </p>
              <p>
                <strong>Filing Date:</strong>{" "}
                {new Date(c.filing_date).toLocaleString()}
              </p>
              <p>
                <strong>Next Date:</strong>{" "}
                {c.next_date ? new Date(c.next_date).toLocaleString() : "None scheduled"}
              </p>
              <Button
                className="mt-4 button-link"
                variant="default"
                onClick={() => router.push(`/offender/dashboard/${id}/cases/${c.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
