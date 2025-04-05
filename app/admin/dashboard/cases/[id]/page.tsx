"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, FileText, User } from "lucide-react"

interface CaseData {
  case: {
    id: number
    case_number: string
    offender_id: number
    offender_name: string
    court: string
    judge: string
    status: string
    next_date: string | null
    created_at: string
    updated_at: string
    case_type?: string | null
    plaintiff?: string | null
    defendant?: string | null
  }
  charges: Array<{
    id: number
    description: string
    statute: string
    severity: string
    disposition: string | null
    charge_date: string
  }>
  hearings: Array<{
    id: number
    date: string
    time: string
    type: string
    location: string
    notes: string | null
  }>
  motions: Array<{
    id: number
    title: string
    status: string
    created_at: string
    updated_at: string
  }>
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const response = await fetch(`/api/admin/cases/${id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch case data")
        }
        const data = await response.json()
        setCaseData(data)
      } catch (err) {
        console.error("Error fetching case data:", err)
        setError(err instanceof Error ? err.message : "Failed to load case data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCaseData()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading case details...</div>
          <div className="text-foreground/60">Please wait while we fetch the case data.</div>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load case data."}</div>
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const { case: caseInfo, charges, hearings, motions } = caseData

  const formatDate = (date: string | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (time: string | null) => {
    if (!time) return "Not set"
    return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-kings text-3xl text-foreground mb-2">
                Case #{caseInfo.case_number}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Link 
                    className="hover:text-foreground transition-colors"
                    href={`/admin/dashboard/offenders/${caseInfo.offender_id}`}
                  >
                    {caseInfo.offender_name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(caseInfo.created_at)}
                </div>
                <Badge 
                  className="capitalize"
                  variant={caseInfo.status === "Active" ? "default" : "secondary"}
                >
                  {caseInfo.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="text-foreground"
                variant="outline"
                onClick={() => router.push(`/admin/dashboard/cases/${id}/edit`)}
              >
                Edit Case
              </Button>
              <Button
                className="bg-primary text-primary-foreground"
                variant="default"
                onClick={() => router.push(`/admin/dashboard/tools/case-upload?offenderId=${caseInfo.offender_id}`)}
              >
                Upload Documents
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-1">Court</h3>
              <p className="text-muted-foreground">{caseInfo.court || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Judge</h3>
              <p className="text-muted-foreground">{caseInfo.judge || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Next Hearing</h3>
              <p className="text-muted-foreground">
                {caseInfo.next_date ? formatDate(caseInfo.next_date) : "None scheduled"}
              </p>
            </div>
            {caseInfo.case_type && (
              <div>
                <h3 className="font-medium text-foreground mb-1">Case Type</h3>
                <p className="text-muted-foreground">{caseInfo.case_type}</p>
              </div>
            )}
            {caseInfo.plaintiff && (
              <div>
                <h3 className="font-medium text-foreground mb-1">Plaintiff</h3>
                <p className="text-muted-foreground">{caseInfo.plaintiff}</p>
              </div>
            )}
            {caseInfo.defendant && (
              <div>
                <h3 className="font-medium text-foreground mb-1">Defendant</h3>
                <p className="text-muted-foreground">{caseInfo.defendant}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs className="w-full" defaultValue="charges">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charges">
            Charges ({charges.length})
          </TabsTrigger>
          <TabsTrigger value="hearings">
            Hearings ({hearings.length})
          </TabsTrigger>
          <TabsTrigger value="motions">
            Motions ({motions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charges">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Charges</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/dashboard/cases/${id}/charges/new`)}
              >
                Add Charge
              </Button>
            </CardHeader>
            <CardContent>
              {charges.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No charges have been added to this case.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Statute</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Disposition</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((charge) => (
                        <tr key={charge.id} className="border-t">
                          <td className="px-4 py-3 text-sm">{charge.description}</td>
                          <td className="px-4 py-3 text-sm">{charge.statute}</td>
                          <td className="px-4 py-3 text-sm">{charge.severity}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(charge.charge_date)}</td>
                          <td className="px-4 py-3 text-sm">{charge.disposition || "Pending"}</td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/admin/dashboard/cases/${id}/charges/${charge.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </td>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hearings</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/dashboard/cases/${id}/hearings/new`)}
              >
                Schedule Hearing
              </Button>
            </CardHeader>
            <CardContent>
              {hearings.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hearings are scheduled for this case.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hearings.map((hearing) => (
                        <tr key={hearing.id} className="border-t">
                          <td className="px-4 py-3 text-sm">{formatDate(hearing.date)}</td>
                          <td className="px-4 py-3 text-sm">{formatTime(hearing.time)}</td>
                          <td className="px-4 py-3 text-sm">{hearing.type}</td>
                          <td className="px-4 py-3 text-sm">{hearing.location}</td>
                          <td className="px-4 py-3 text-sm truncate max-w-[200px]">{hearing.notes || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/admin/dashboard/cases/${id}/hearings/${hearing.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Motions</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/dashboard/tools/motions-editor?caseId=${id}`)}
              >
                Create Motion
              </Button>
            </CardHeader>
            <CardContent>
              {motions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No motions have been filed for this case.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Filed</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {motions.map((motion) => (
                        <tr key={motion.id} className="border-t">
                          <td className="px-4 py-3 text-sm">{motion.title}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge
                              className="capitalize"
                              variant={
                                motion.status === "Draft"
                                  ? "secondary"
                                  : motion.status === "Submitted"
                                  ? "default"
                                  : motion.status === "Approved"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {motion.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(motion.created_at)}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(motion.updated_at)}</td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/admin/dashboard/tools/motions-editor?id=${motion.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
