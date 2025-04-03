"use client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

interface OffenderData {
  offender: {
    id: number
    inmate_number: string
    name: string
    status: string
    facility: string
    registered_date: string
    has_mugshot: boolean
  }
  cases: Array<{
    id: number
    case_number: string
    court: string
    status: string
    next_date: string | null
  }>
}

export default function OffenderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [offenderData, setOffenderData] = useState<OffenderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOffenderData() {
      try {
        const response = await fetch(`/api/admin/offenders/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch offender data")
        }
        const data = await response.json()
        setOffenderData(data)
      } catch (err) {
        console.error("Error fetching offender data:", err)
        setError("Failed to load offender data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchOffenderData()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-background">
            Loading offender details...
          </div>
          <div className="text-foreground/60">
            Please wait while we fetch the offender data.
          </div>
        </div>
      </div>
    )
  }

  if (error || !offenderData) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">
            {error || "Failed to load offender data."}
          </div>
          <Button className="button-link" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const { offender, cases } = offenderData

  return (
    <div className="card-secondary space-y-4 p-4">
      {/* Header Block */}
      <div className="card-primary p-4">
        <h1 className="font-kings text-3xl text-primary-foreground mb-2">
          Offender: {offender.name}
        </h1>
        <p className="text-primary-foreground">
          View and manage all details related to this offender.
        </p>
      </div>

      {/* Offender Information */}
      <div className="card-content space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-4">
            {offender.has_mugshot ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-foreground/20">
                <Image
                  fill
                  alt={`Mugshot of ${offender.name}`}
                  className="object-cover"
                  src={`/api/admin/offenders/${id}/mugshot`}
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-foreground/20 bg-foreground/5">
                <p className="text-center text-foreground/60">No mugshot available</p>
              </div>
            )}
            <div>
              <Link href={`/admin/dashboard/tools/mugshot-upload?offenderId=${id}`}>
                <Button className="button-link w-full" variant="outline">
                  {offender.has_mugshot ? "Update Mugshot" : "Upload Mugshot"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="font-kings text-xl text-foreground mb-4">
              Offender Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-content p-3">
                <p className="text-sm font-medium">Inmate Number</p>
                <p className="mt-1">{offender.inmate_number}</p>
              </div>
              <div className="card-content p-3">
                <p className="text-sm font-medium">Status</p>
                <p className="mt-1">{offender.status}</p>
              </div>
              <div className="card-content p-3">
                <p className="text-sm font-medium">Facility</p>
                <p className="mt-1">{offender.facility}</p>
              </div>
              <div className="card-content p-3">
                <p className="text-sm font-medium">Registered Date</p>
                <p className="mt-1">
                  {new Date(offender.registered_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/dashboard/tools/offender-profile?id=${id}`}>
                <Button className="button-link" variant="outline">
                  Edit Profile
                </Button>
              </Link>
              <Button className="button-link" variant="outline">
                Notify Offender
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Tab */}
      <Card className="card-content">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-kings text-foreground">Cases</CardTitle>
          <Link href={`/admin/dashboard/tools/case-upload?offenderId=${id}`}>
            <Button className="button-link" size="sm" variant="outline">
              Add Case
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="card-content p-4 text-center">
              <p className="text-foreground/60">No cases found for this offender.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-foreground/20">
              <table className="w-full border-collapse">
                <thead className="bg-foreground/10">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Case Number</th>
                    <th className="px-4 py-2 text-left font-medium">Court</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Next Date</th>
                    <th className="px-4 py-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="border-t border-foreground/10 hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2">{caseItem.case_number}</td>
                      <td className="px-4 py-2">{caseItem.court}</td>
                      <td className="px-4 py-2">{caseItem.status}</td>
                      <td className="px-4 py-2">
                        {caseItem.next_date
                          ? new Date(caseItem.next_date).toLocaleDateString()
                          : "None"}
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/admin/dashboard/cases/${caseItem.id}`}>
                          <Button className="button-link" size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
