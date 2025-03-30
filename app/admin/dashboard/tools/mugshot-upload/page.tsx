"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Image from "next/image"

interface OffenderData {
  id: number
  inmate_number: string
  last_name: string
  first_name: string
  middle_name?: string
  mugshot_url?: string
}

export default function MugshotUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [offenderId, setOffenderId] = useState<string | null>(null)
  const [offenderData, setOffenderData] = useState<OffenderData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OffenderData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // If an offender ID is provided in the URL, fetch their data
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setOffenderId(id)
      fetchOffenderData(id)
    }
  }, [searchParams])

  const fetchOffenderData = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/offenders/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch offender data")
      }
      const data = await response.json()
      setOffenderData(data.offender)
      // If offender already has a mugshot, use it as preview
      if (data.offender.mugshot_url) {
        setPreviewUrl(data.offender.mugshot_url)
      }
    } catch (error) {
      console.error("Error fetching offender:", error)
      toast.error("Failed to load offender data")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection and update preview image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // Restore existing mugshot if available, or clear preview
      if (offenderData?.mugshot_url) {
        setPreviewUrl(offenderData.mugshot_url)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  // Handle search for offenders by name or inmate number
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/offenders/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error("Failed to search offenders")
      }
      const data = await response.json()
      setSearchResults(data.offenders || [])
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search offenders")
    } finally {
      setIsLoading(false)
    }
  }

  // Select an offender from the search results
  const selectOffender = (offender: OffenderData) => {
    setOffenderId(offender.id.toString())
    setOffenderData(offender)
    setSearchResults([])
    setSearchQuery("")
    if (offender.mugshot_url) {
      setPreviewUrl(offender.mugshot_url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Handle the mugshot upload action
  const handleUpload = async () => {
    if (!selectedFile || !offenderId) {
      toast.error("Please select a file and an offender")
      return
    }
    setIsUploading(true)
    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("mugshot", selectedFile)

      // Upload the mugshot to the API endpoint
      const response = await fetch(`/api/admin/offenders/${offenderId}/mugshot`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload mugshot")
      }

      const result = await response.json()
      toast.success("Mugshot uploaded successfully")
      // Update offender data with the new mugshot URL and update preview
      setOffenderData((prev) => (prev ? { ...prev, mugshot_url: result.mugshot_url } : null))
      setPreviewUrl(result.mugshot_url)
      // Clear file selection (keeping the preview intact)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Redirect to the offender's profile page
      router.push(`/admin/dashboard/offenders/${offenderId}`)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload mugshot")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Mugshot Upload</h1>

      {/* Offender Selection */}
      {!offenderId && (
        <Card>
          <CardHeader>
            <CardTitle>Select Offender</CardTitle>
            <CardDescription>Search for an offender to upload a mugshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name or inmate number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-md border border-foreground/20">
                <table className="w-full border-collapse">
                  <thead className="bg-foreground/10">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Inmate #</th>
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((offender) => (
                      <tr key={offender.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                        <td className="px-4 py-2">{offender.inmate_number}</td>
                        <td className="px-4 py-2">
                          {offender.last_name}, {offender.first_name} {offender.middle_name || ""}
                        </td>
                        <td className="px-4 py-2">
                          <Button variant="outline" size="sm" onClick={() => selectOffender(offender)}>
                            Select
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
      )}

      {/* Offender Details & Mugshot Upload */}
      {offenderId && offenderData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Offender Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Inmate Number</p>
                  <p className="font-medium">{offenderData.inmate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {offenderData.last_name}, {offenderData.first_name} {offenderData.middle_name || ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setOffenderId(null)
                  setOffenderData(null)
                  setPreviewUrl(null)
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                Change Offender
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Mugshot</CardTitle>
              <CardDescription>Select an image file to upload as the offender's mugshot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="mugshot">Mugshot Image</Label>
                  <Input
                    id="mugshot"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Accepted formats: JPG, PNG, GIF. Maximum size: 5MB.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-48 w-36 overflow-hidden rounded-md border border-foreground/20">
                    {previewUrl ? (
                      <Image src={previewUrl || "/placeholder.svg"} alt="Mugshot Preview" fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-center text-sm text-foreground/60">
                        No image selected
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-center">
                    {previewUrl && !selectedFile ? "Current Mugshot" : "Preview"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-foreground text-background"
              >
                {isUploading ? "Uploading..." : "Upload Mugshot"}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
