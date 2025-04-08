// app/admin/dashboard/cases/[id]/page.tsx

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
          <div className="mb-4 text-2xl font-bold text-background">
            Loading case details...
          </div>
          <div className="text-sm text-background/60">
            Please wait while we fetch the case data.
          </div>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-sm text-background/60">
            {error || "Failed to load case data."}
          </div>
          <Button className="button-link" onClick={() => window.location.reload()}>
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
      day: "numeric",
    })
  }

  const formatTime = (time: string | null) => {
    if (!time) return "Not set"
    return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="card-secondary space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="font-kings text-background text-3xl mb-2">
          Case #{caseInfo.case_number}
        </h1>
      </div>
      <div className="card-content">
        <div className="flex flex-col gap-4">
          <div className="flex justify-items-center gap-x-16">
            <div className="flex text-2xl font-semi-bold items-center gap-4">
              <User className="h-6 w-6" />
              <Link
                className="hover:text-background transition-colors"
                href={`/admin/dashboard/offenders/${caseInfo.offender_id}`}
              >
                {caseInfo.offender_name}
              </Link>
            </div>
            <div className="flex text-2xl font-semi-bold items-center gap-4">
              <Calendar className="h-6 w-6" />
              Created {formatDate(caseInfo.created_at)}
            </div>
            <div className="flex text-2xl font-semi-bold items-center gap-4">
            Status:
            <Badge
                variant={hearings.length > 0 ? "success" : "error"}
              >
              {hearings.length > 0 ? "Active" : "Inactive"}
              </Badge>
              </div>
          </div>
  
        </div>
        <div className="card-content grid grid-cols-3 gap-6">
          <div>
            <h3 className="font-semi-bold text-xl mb-1">Court:</h3>
            <p>{caseInfo.court || "Not assigned"}</p>
          </div>
          <div>
            <h3 className="font-semi-bold text-xl mb-1">Judge:</h3>
            <p>{caseInfo.judge || "Not assigned"}</p>
          </div>
          <div>
            <h3 className="font-semi-bold text-xl mb-1">Next Hearing:</h3>
            <p>
              {caseInfo.next_date ? formatDate(caseInfo.next_date) : "None scheduled"}
            </p>
          </div>
          {caseInfo.case_type && (
            <div>
              <h3 className="font-bold mb-1">Case Type</h3>
              <p>{caseInfo.case_type}</p>
            </div>
          )}
          {caseInfo.plaintiff && (
            <div>
              <h3 className="font-bold mb-1">Plaintiff</h3>
              <p>{caseInfo.plaintiff}</p>
            </div>
          )}
          {caseInfo.defendant && (
            <div>
              <h3 className="font-bold mb-1">Defendant</h3>
              <p>{caseInfo.defendant}</p>
            </div>
          )}
        </div>
        <Tabs className="w-full" defaultValue="charges">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              className="bg-foreground font-kings text-background"
              value="charges">
              Charges ({charges.length})
            </TabsTrigger>
            <TabsTrigger className="bg-foreground font-kings text-background" value="hearings">
              Hearings ({hearings.length})
            </TabsTrigger>
            <TabsTrigger className="bg-foreground font-kings text-background" value="motions">
              Motions ({motions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-kings font-bold text-2xl mt-3 text-foreground">Charges</CardTitle>
                <Button
                  className="button-link"
                  variant="default"
                  onClick={() =>
                    router.push(`/admin/dashboard/cases/${id}/charges/new`)
                  }
                >
                  Add Charge
                </Button>
              </CardHeader>
              <CardContent className="card-content">
                {charges.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-foreground mb-4" />
                    <p className="text-foreground">
                      No charges have been added to this case.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Statute
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Disposition
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {charges.map((charge) => (
                          <tr key={charge.id} className="border-b rounded-lg">
                            <td className="px-4 py-3 text-sm">{charge.description}</td>
                            <td className="px-4 py-3 text-sm">{charge.statute}</td>
                            <td className="px-4 py-3 text-sm">
                              {formatDate(charge.charge_date)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {charge.disposition || "Pending"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button
                                className="button-link"
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  router.push(
                                    `/admin/dashboard/cases/${id}/charges/${charge.id}/edit`
                                  )
                                }
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
                <CardTitle className="font-kings font-bold text-2xl mt-3 text-foreground">Hearings</CardTitle>
                <Button
                  className="button-link mt-2"
                  variant="default"
                  onClick={() =>
                    router.push(`/admin/dashboard/cases/${id}/hearings/new`)
                  }
                >
                  Schedule Hearing
                </Button>
              </CardHeader>
              <CardContent className="card-content">
                {hearings.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-background/60 mb-4" />
                    <p className="text-background/60">
                      No hearings are scheduled for this case.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Time
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hearings.map((hearing) => (
                          <tr key={hearing.id} className="border-t">
                            <td className="px-4 py-3 text-sm">
                              {formatDate(hearing.date)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatTime(hearing.time)}
                            </td>
                            <td className="px-4 py-3 text-sm">{hearing.type}</td>
                            <td className="px-4 py-3 text-sm">{hearing.location}</td>
                            <td className="px-4 py-3 text-sm truncate max-w-[200px]">
                              {hearing.notes || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button
                                className="button-link"
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  router.push(
                                    `/admin/dashboard/cases/${id}/hearings/${hearing.id}/edit`
                                  )
                                }
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
              <CardHeader className="flex flex-row items-center justify-between mt-2">
                <CardTitle className="font-kings font-bold text-2xl text-foreground">Motions</CardTitle>
                <Button
                  className="button-link"
                  variant="default"
                  onClick={() =>
                    router.push(`/admin/dashboard/tools/motions-editor?caseId=${id}`)
                  }
                >
                  Create Motion
                </Button>
              </CardHeader>
              <CardContent className="card-content">
                {motions.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mx-auto h-8 w-8  mb-4" />
                    <p className="">
                      No motions have been filed for this case.
                    </p>
                  </div>
                ) : (
                    <table className="w-full">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Filed
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Updated
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Actions
                          </th>
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
                                    ? "outline"
                                    : motion.status === "Approved"
                                    ? "success"
                                    : "error"
                                }
                              >
                                {motion.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatDate(motion.created_at)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatDate(motion.updated_at)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button
                                className="button-link"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(
                                    `/admin/dashboard/tools/motions-editor?id=${motion.id}`
                                  )
                                }
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
