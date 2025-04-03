"use client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { Download, Loader2 } from "lucide-react"

interface Motion {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  updated_at: string
  pdf_url?: string
  case: {
    id: number
    case_number: string
    court: string
    judge?: string
  }
}

export default function OffenderMotionDetailsPage() {
  const { id, motionId } = useParams<{ id: string; motionId: string }>()
  const [motion, setMotion] = useState<Motion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function fetchMotionDetails() {
      try {
        const response = await fetch(`/api/offenders/${id}/motions/${motionId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch motion details")
        }
        const data = await response.json()
        setMotion(data.motion)
      } catch (error) {
        console.error("Error fetching motion details:", error)
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load motion details. Please try again later."
        )
      } finally {
        setIsLoading(false)
      }
    }
    if (id && motionId) {
      fetchMotionDetails()
    }
  }, [id, motionId])

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(`/api/offenders/${id}/motions/${motionId}/download-pdf`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to download PDF")
      }
      const data = await response.json()
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank")
      } else {
        throw new Error("PDF URL not found")
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to download PDF"
      )
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-background">
            Loading motion details...
          </div>
          <div className="text-sm text-background">
            Please wait while we fetch the motion data.
          </div>
        </div>
      </div>
    )
  }

  if (error || !motion) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-sm text-background">
            {error || "Failed to load motion details."}
          </div>
          <Button className="button-link" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-kings text-background text-2xl font-bold">
          Motion Details
        </h1>
        {motion.pdf_url && (
          <Button className="button-link" disabled={isDownloading} onClick={handleDownloadPdf}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        )}
      </div>
      <Card className="card-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-kings text-background text-xl">
              {motion.title}
            </CardTitle>
            <Badge variant={motion.status === "approved" ? "default" : "outline"}>
              {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="card-content">
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-background">
                Case Number:
              </span>{" "}
              <Link
                className="text-blue-600 hover:underline"
                href={`/offender/dashboard/${id}/cases/${motion.case.id}`}
              >
                {motion.case.case_number}
              </Link>
            </div>
            <div>
              <span className="font-medium text-background">Court:</span>{" "}
              {motion.case.court}
            </div>
          </div>
          <p className="text-background">{motion.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}
