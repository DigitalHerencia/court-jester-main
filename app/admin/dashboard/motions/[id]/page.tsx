"use client"
import { useParams } from "next/navigation"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { Download, Loader2 } from "lucide-react"

interface MotionTemplate {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  modified_at: string
  pdf_url?: string
}

export default function MotionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<MotionTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isPdfGenerationEnabled, setIsPdfGenerationEnabled] = useState(false)

  useEffect(() => {
    async function fetchTemplateDetails() {
      try {
        const response = await fetch(`/api/admin/motions/${id}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch motion template details")
        }
        const data = await response.json()
        setTemplate(data.template)

        // Check if PDF generation is enabled
        const configResponse = await fetch("/api/admin/config")
        if (configResponse.ok) {
          const configData = await configResponse.json()
          setIsPdfGenerationEnabled(configData.enablePdfGeneration)
        }
      } catch (error) {
        console.error("Error fetching motion template details:", error)
        setError(
          error instanceof Error ? error.message : "Failed to load motion template details. Please try again later.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTemplateDetails()
    }
  }, [id])

  const handleGeneratePdf = async () => {
    if (!isPdfGenerationEnabled) {
      toast.error("PDF generation is not enabled")
      return
    }

    try {
      const response = await fetch("/api/admin/motions/generate-pdf") // Replace with the actual API endpoint
      const data = await response.json()
      // Update the template with the new PDF URL
      setTemplate((prev) => (prev ? { ...prev, pdf_url: data.pdfUrl } : null))
      toast.success("PDF generated successfully")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate PDF")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading template details...</div>
          <div className="text-foreground/60">Please wait while we fetch the template data.</div>
        </div>
      </div>
    )
  }

  if (Error() || !template) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load motion template details."}</div>
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Motion Template Details</h1>
        {template.pdf_url && (
          <Button className="bg-foreground text-background" disabled={isGeneratingPdf} onClick={handleGeneratePdf}>
            {isGeneratingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{template.title}</CardTitle>
            <Badge variant={template.status === "approved" ? "default" : "outline"}>
              {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span>{" "}
              {template.content ? template.content.substring(0, 100) + "..." : "N/A"}
            </div>
            <div>
              <span className="font-medium">Last Modified:</span> {formatDate(template.modified_at)}
            </div>
          </div>
          <p>{template.content}</p>
          {template.pdf_url && (
            <div className="mt-4">
              <h2 className="font-medium">Generated PDF:</h2>
              <Link className="text-blue-600 hover:underline" href={template.pdf_url} target="_blank">
                View PDF
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Link href="/admin/dashboard/tools/motions-editor">
          <Button className="bg-foreground text-background">Create Template</Button>
        </Link>
      </div>
    </div>
  )
}

