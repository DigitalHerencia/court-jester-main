"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, FileText, Save } from "lucide-react"

interface Offender {
  id: number
  inmate_number: string
  last_name: string
  first_name: string
}

export default function CaseUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [offenderId, setOffenderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [offenders, setOffenders] = useState<Offender[]>([])
  const [isLoadingOffenders, setIsLoadingOffenders] = useState(false)
  const router = useRouter()

  // Fetch offenders on component mount
  useEffect(() => {
    const fetchOffenders = async () => {
      setIsLoadingOffenders(true)
      try {
        const response = await fetch("/api/admin/offenders")

        if (!response.ok) {
          console.error("Failed to fetch offenders:", response.status, response.statusText)
          setIsLoadingOffenders(false)
          return
        }

        const data = await response.json()
        setOffenders(data.offenders || [])
      } catch (error) {
        console.error("Error fetching offenders", error)
      } finally {
        setIsLoadingOffenders(false)
      }
    }

    fetchOffenders()
  }, [])

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) {
      setSelectedFile(null)
      setExtractedText("")
      return
    }

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError("")

    // Extract text from PDF
    await extractTextFromPdf(file)
  }

  // Extract text from PDF using PDF.js
  const extractTextFromPdf = async (file: File) => {
    setIsExtracting(true)
    setError("")

    try {
      // Load the PDF.js library dynamically
      const pdfjsLib = await import("pdfjs-dist")

      // Set the worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      let fullText = ""

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        fullText += pageText + "\n"
      }

      setExtractedText(fullText)
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      setError("Failed to extract text from PDF. Please try again.")

      // Fallback: Ask user to paste the text manually
      toast.error("PDF extraction failed. Please copy and paste the case text manually.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    if (!extractedText.trim() || !offenderId) {
      setError("Please select an offender and provide case text")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseText: extractedText, offenderId: Number.parseInt(offenderId) }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process case: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSuccess(true)
      setSelectedFile(null)
      setExtractedText("")
      setOffenderId("")
      toast.success("Case created successfully!")

      // Redirect back to admin dashboard
      setTimeout(() => {
        router.push("/admin/dashboard/offenders")
      }, 2000)
    } catch (error) {
      console.error("Case upload error", error)
      setError("An error occurred. Please try again.")
      toast.error("Failed to create case")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Upload Case File
          </CardTitle>
          <CardDescription>
            Upload a case file PDF or paste the case text below and select the offender. The system will parse the
            information and create a case record in the database.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offender">Select Offender</Label>
              <Select value={offenderId} onValueChange={setOffenderId} disabled={isLoading || isLoadingOffenders}>
                <SelectTrigger id="offender">
                  <SelectValue placeholder="Select an offender..." />
                </SelectTrigger>
                <SelectContent>
                  {offenders.map((offender) => (
                    <SelectItem key={offender.id} value={offender.id.toString()}>
                      {offender.inmate_number} - {offender.last_name}, {offender.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingOffenders && <p className="text-sm text-muted-foreground">Loading offenders...</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfFile">Upload PDF File</Label>
              <Input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isLoading || isExtracting}
              />
              {isExtracting && <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>}
              {selectedFile && !isExtracting && (
                <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseText">Case Text</Label>
              <p className="text-sm text-muted-foreground">
                {selectedFile ? "Extracted from PDF (you can edit if needed):" : "Or paste case text manually:"}
              </p>
              <Textarea
                id="caseText"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Case text will appear here after PDF upload, or you can paste it manually..."
                className="min-h-[200px] font-mono"
                disabled={isLoading || isExtracting}
              />
            </div>

            {error && (
              <div className="flex items-center p-3 text-sm bg-red-50 border border-red-200 text-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center p-3 text-sm bg-green-50 border border-green-200 text-green-800 rounded-md">
                Case uploaded successfully!
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/tools")}
              disabled={isLoading || isExtracting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isLoading || isExtracting || !extractedText.trim() || !offenderId}>
              {isLoading ? "Processing..." : "Create Case"}
              {!isLoading && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

