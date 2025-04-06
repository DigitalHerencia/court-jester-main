"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Case {
  id: number
  case_number: string
  court: string
  judge: string
  status: string
  filing_date: string
  next_date: string | null
  charges_count: number
  upcoming_hearings_count: number
  case_type?: string | null
}

export default function CasesListPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cases, setCases] = useState<Case[]>([])

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(`/api/offenders/${id}/cases`)
        if (!response.ok) {
          throw new Error("Failed to fetch cases")
        }
        const data = await response.json()
        setCases(data.cases || [])
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError(err instanceof Error ? err.message : "Failed to load cases")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCases()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading cases...</div>
          <div className="text-foreground/60">Please wait while we fetch your cases.</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">My Cases</h1>
        <p className="text-muted-foreground">
          View and manage all your court cases
        </p>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">No cases found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {cases.map((case_) => (
            <Card
              key={case_.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/offender/dashboard/${id}/cases/${case_.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Case #{case_.case_number}</CardTitle>
                    <CardDescription>
                      Filed on {format(new Date(case_.filing_date), "MMMM d, yyyy")}
                    </CardDescription>
                    {case_.case_type && (
                      <p className="text-sm text-muted-foreground">Type: {case_.case_type}</p>
                    )}
                  </div>
                  <Badge variant={case_.status === "Active" ? "secondary" : "secondary"}>
                    {case_.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-1 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Court</dt>
                    <dd>{case_.court}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Judge</dt>
                    <dd>{case_.judge || "Not assigned"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Charges</dt>
                    <dd>{case_.charges_count}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Upcoming Hearings</dt>
                    <dd>{case_.upcoming_hearings_count}</dd>
                  </div>
                  {case_.next_date && (
                    <div className="col-span-2 mt-2">
                      <dt className="font-medium text-muted-foreground">Next Court Date</dt>
                      <dd>{format(new Date(case_.next_date), "MMMM d, yyyy")}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
