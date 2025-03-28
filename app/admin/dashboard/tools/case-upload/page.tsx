"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

  // Sample offenders for fallback
  const sampleOffenders: Offender[] = [
    {
      id: 1,
      inmate_number: "468079",
      last_name: "Dominguez",
      first_name: "Christopher",
    },
    {
      id: 2,
      inmate_number: "123456",
      last_name: "Doe",
      first_name: "John",
    },
  ]

  // Fetch offenders on component mount
  useEffect(() => {
    const fetchOffenders = async () => {
      setIsLoadingOffenders(true)
      try {
        const response = await fetch("/api/admin/offenders")

        if (!response.ok) {
          console.error("Failed to fetch offenders:", response.status, response.statusText)
          // Use sample data as fallback
          setOffenders(sampleOffenders)
          setIsLoadingOffenders(false)
          return
        }

        const data = await response.json()
        setOffenders(data.offenders || [])
      } catch (error) {
        console.error("Error fetching offenders", error)
        // Use sample data as fallback
        setOffenders(sampleOffenders)
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
        setError(`Failed to process case: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setSuccess(true)
      setSelectedFile(null)
      setExtractedText("")
      setOffenderId("")

      // Redirect back to admin dashboard
      toast.success("Case created successfully!")
      setTimeout(() => {
        router.push("/dashboard/admin")
      }, 2000)
    } catch (error) {
      console.error("Case upload error", error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-4 text-xl">Upload Case File</h2>
        <p className="mb-4">
          Upload a case file PDF or paste the case text below and select the offender. The system will parse the
          information and create a case record in the database.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-kings">Select Offender</label>
            <select
              value={offenderId}
              onChange={(e) => setOffenderId(e.target.value)}
              className="w-full p-3 border border-background/20 bg-background text-foreground font-kings"
              disabled={isLoading || isLoadingOffenders}
            >
              <option value="">Select an offender...</option>
              {offenders.map((offender) => (
                <option key={offender.id} value={offender.id}>
                  {offender.inmate_number} - {offender.last_name}, {offender.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-kings">Upload PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-3 border border-background/20 bg-background text-foreground font-kings"
              disabled={isLoading || isExtracting}
            />
            {isExtracting && <p className="mt-2 text-center">Extracting text from PDF...</p>}
            {selectedFile && !isExtracting && <p className="mt-2">Selected file: {selectedFile.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-kings">Case Text</label>
            <p className="text-sm mb-2">
              {selectedFile ? "Extracted from PDF (you can edit if needed):" : "Or paste case text manually:"}
            </p>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Case text will appear here after PDF upload, or you can paste it manually..."
              className="w-full p-3 border border-background/20 bg-background text-foreground font-kings min-h-[200px]"
              disabled={isLoading || isExtracting}
            />
            {error && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                {error}
              </p>
            )}
            {success && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                Case uploaded successfully!
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-background/20 hover:bg-background hover:text-foreground bg-foreground text-background"
              onClick={() => router.push("/dashboard/admin")}
              disabled={isLoading || isExtracting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-background text-foreground hover:bg-background/90"
              disabled={isLoading || isExtracting || !extractedText.trim() || !offenderId}
            >
              {isLoading ? "Processing..." : "Create Case"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

