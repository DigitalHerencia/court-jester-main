// ✅ Path: app/offender/dashboard/[id]/cases/[caseId]/page.tsx

"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, User } from "lucide-react"
import Link from "next/link"

interface CaseDetail {
  id: number
  case_number: string
  offender_id: number
  offender_name: string
  court: string
  judge: string
  next_date: string | null
  created_at: string
  charges: {
    id: number
    description: string
    statute: string
    class: string
    citation_number: string
    disposition: string
    charge_date: string
  }[]
}

export default function OffenderCaseDetailPage() {
  const params = useParams()
  const offenderId = params?.id
  const caseId = params?.caseId

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!offenderId || !caseId) return

    async function fetchCaseData() {
      try {
        const res = await fetch(`/api/offenders/${offenderId}/cases/${caseId}`)
        if (!res.ok) throw new Error("Failed to fetch case detail")
        const data = await res.json()
        setCaseDetail(data.data)
      } catch (error) {
        console.error("Error fetching case detail:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCaseData()
  }, [offenderId, caseId])

  const formatDate = (date: string | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return <div className="text-center mt-10">Loading case details...</div>
  }

  if (!caseDetail) {
    return <div className="text-center mt-10">Case not found.</div>
  }

  return (
    <div className="card-secondary space-y-6">
      <h1 className="font-kings text-background text-3xl mb-2">
        Case #{caseDetail.case_number}
      </h1>

      <div className="card-content">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              {caseDetail.offender_name}
            </div>
            <div className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" />
              Created {formatDate(caseDetail.created_at)}
            </div>
            <div className="flex items-center gap-2 text-xl">
              Status:
              <Badge variant={caseDetail.next_date ? "success" : "secondary"}>
                {caseDetail.next_date ? "Active" : "No Next Date"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold">Court:</h3>
              <p>{caseDetail.court || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Judge:</h3>
              <p>{caseDetail.judge || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Next Hearing:</h3>
              <p>{formatDate(caseDetail.next_date)}</p>
            </div>
          </div>
        </div>

        <Tabs className="w-full mt-6" defaultValue="charges">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
            <TabsTrigger className="font-kings bg-foreground text-background" value="charges">
              Charges ({caseDetail.charges.length})
            </TabsTrigger>
            <TabsTrigger className="font-kings bg-foreground text-background" value="hearings">
              Hearings (Coming Soon)
            </TabsTrigger>
            <TabsTrigger className="font-kings bg-foreground text-background" value="motions">
              Motions (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <CardTitle className="font-kings text-2xl">Charges</CardTitle>
              </CardHeader>
              <CardContent>
                {caseDetail.charges.length === 0 ? (
                  <div className="border-dashed border rounded p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 mb-4" />
                    <p>No charges recorded for this case.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="bg-background text-left">
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Statute</th>
                          <th className="px-4 py-2">Class</th>
                          <th className="px-4 py-2">Citation</th>
                          <th className="px-4 py-2">Disposition</th>
                          <th className="px-4 py-2">Filed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseDetail.charges.map((charge) => (
                          <tr key={charge.id} className="border-t">
                            <td className="px-4 py-2">{charge.description}</td>
                            <td className="px-4 py-2">{charge.statute}</td>
                            <td className="px-4 py-2">{charge.class}</td>
                            <td className="px-4 py-2">{charge.citation_number}</td>
                            <td className="px-4 py-2">{charge.disposition || "Pending"}</td>
                            <td className="px-4 py-2">{formatDate(charge.charge_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hearings">
            <div className="text-sm text-muted-foreground p-4">
              Hearings will be shown here soon.
            </div>
          </TabsContent>

          <TabsContent value="motions">
            <div className="text-sm text-muted-foreground p-4">
              Motions will be shown here soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4">
        <Link className="text-primary underline" href={`/offender/dashboard/${offenderId}/cases`}>
          &larr; Back to Cases
        </Link>
      </div>
    </div>
  )
}
