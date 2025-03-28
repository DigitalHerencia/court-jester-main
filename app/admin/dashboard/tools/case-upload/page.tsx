"use client"

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
  const [fetchError, setFetchError] = useState("")
  const router = useRouter()

  // Fetch offenders on component mount (production: no fallback data)
  const fetchOffenders = async () => {
    setIsLoadingOffenders(true)
    setFetchError("")
    try {
      const response = await fetch("/api/admin/offenders")
      if (!response.ok) {
        throw new Error(`Failed to fetch offenders: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setOffenders(data.offenders || [])
    } catch (err) {
      console.error("Error fetching offenders:", err)
      setFetchError("Unable to load offender data. Please check your database connection and try again.")
      setOffenders([])
    } finally {
      setIsLoadingOffenders(false)
    }
  }

  useEffect(() => {
    fetchOffenders()
  }, [])

  // Handle file selection and PDF extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) {
      setSelectedFile(null)
      setExtractedText("")
      return
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file")
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError("")

    await extractTextFromPdf(file)
  }

  const extractTextFromPdf = async (file: File) => {
    setIsExtracting(true)
    setError("")

    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        fullText += pageText + "\n"
      }
      setExtractedText(fullText)
    } catch (err) {
      console.error("Error extracting text from PDF:", err)
      setError("Failed to extract text from PDF. Please try again or paste the case text manually.")
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
        headers: { "Content-Type": "application/json" },
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
      toast.success("Case created successfully!")
      setTimeout(() => router.push("/dashboard/admin"), 2000)
    } catch (err) {
      console.error("Case upload error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-4 text-xl">Upload Case File</h2>
        <p className="mb-4">
          Upload a case file PDF or paste the case text below and select the offender. The system will parse the information
          and create a case record in the database.
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
            {fetchError && (
              <div className="mt-2 text-red-500">
                <p>{fetchError}</p>
                <Button onClick={fetchOffenders} className="mt-2 bg-background text-foreground hover:bg-background/90">
                  Retry
                </Button>
              </div>
            )}
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
