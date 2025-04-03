"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"

interface OffenderItem {
  id: number
  inmate_number: string
  name: string
  status: string
  facility: string
}

export default function MugshotUploadPage() {
  const router = useRouter()
  const [offenderId, setOffenderId] = useState<string | null>(null)
  const [offenders, setOffenders] = useState<OffenderItem[]>([])

  useEffect(() => {
    async function fetchOffenders() {
      try {
        const res = await fetch("/api/admin/offenders")
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`)
        }
        const data = await res.json()
        setOffenders(data.offenders || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load offenders")
      }
    }
    fetchOffenders()
  }, [])

  const handleOffenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOffenderId(e.target.value)
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !offenderId) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("mugshot", selectedFile)

      const response = await fetch(`/api/admin/offenders/${offenderId}/mugshot`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload mugshot")
      }

      toast.success("Mugshot uploaded successfully")
      // Redirect back to offender profile
      router.push(`/admin/dashboard/offenders/${offenderId}`)
    } catch (error) {
      console.error("Error uploading mugshot:", error)
      toast.error("Failed to upload mugshot")
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      {/* Title block */}
      <div className="card-primary p-4">
        <h2 className="font-kings text-3xl text-primary-foreground mb-2">Mugshot Upload</h2>
        <p className="text-primary-foreground">Upload a mugshot image for the offender.</p>
      </div>

      {/* Offender selection */}
      <div className="mb-4">
        <label className="font-kings text-background mb-2 block" htmlFor="offender-select">
          Select Offender
        </label>
        <select
          className="w-full border border-foreground/20 p-2 rounded-md bg-background text-foreground"
          id="offender-select"
          value={offenderId || ""}
          onChange={handleOffenderChange}
        >
          <option value="">-- Select an Offender --</option>
          {offenders.map((offender) => (
            <option key={offender.id} value={offender.id.toString()}>
              {offender.name} ({offender.inmate_number})
            </option>
          ))}
        </select>
      </div>

      {/* If no offender selected, show message */}
      {!offenderId ? (
        <div className="flex h-[calc(100vh-120px)] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
            <div className="mb-4 text-foreground/60">Offender ID is required.</div>
            <Button className="button-link" onClick={() => router.push("/admin/dashboard/offenders")}>
              Back to Offenders
            </Button>
          </div>
        </div>
      ) : (
        // Main content block: Only render when offender is selected
        <Card className="card-content">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Upload Instructions */}
              <div>
                <h3 className="font-kings text-lg mb-4 text-background">Upload Instructions</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-background">
                  <li>Select a clear frontal image of the offender</li>
                  <li>Image must be in JPG, PNG, or WEBP format</li>
                  <li>Maximum file size is 5MB</li>
                  <li>Recommended dimensions: 600x800 pixels</li>
                  <li>Ensure proper lighting and neutral background</li>
                </ul>

                <div className="mt-6">
                  <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <Button className="w-full button-link" variant="default" onClick={triggerFileInput}>
                    Select Image
                  </Button>
                </div>
              </div>

              {/* Right Column: Image Preview & Actions */}
              <div>
                <h3 className="font-kings text-lg mb-4 text-background">Image Preview</h3>
                <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-foreground/20 bg-foreground/5">
                  {preview ? (
                    <Image
                      alt="Mugshot preview"
                      className="h-full w-full object-cover"
                      height={800}
                      src={preview || "/placeholder.svg"}
                      width={600}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-center text-foreground/60">No image selected</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    className="button-link"
                    variant="default"
                    onClick={() => router.push(`/admin/dashboard/offenders/${offenderId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="button-link"
                    disabled={!selectedFile || isUploading}
                    onClick={handleUpload}
                  >
                    {isUploading ? "Uploading..." : "Upload Mugshot"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
