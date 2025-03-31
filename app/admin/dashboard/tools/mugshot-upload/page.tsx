"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function MugshotUploadPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const offenderId = searchParams.get("offenderId")

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!offenderId) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">Offender ID is required.</div>
          <Button className="bg-foreground text-background" onClick={() => router.push("/admin/dashboard/offenders")}>
            Back to Offenders
          </Button>
        </div>
      </div>
    )
  }

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
    <div className="space-y-2">
      {/* Title block */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Mugshot Upload</h2>
        <p>Upload a mugshot image for the offender.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-kings text-lg mb-4">Upload Instructions</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Select a clear frontal image of the offender</li>
                <li>Image must be in JPG, PNG, or WEBP format</li>
                <li>Maximum file size is 5MB</li>
                <li>Recommended dimensions: 600x800 pixels</li>
                <li>Ensure proper lighting and neutral background</li>
              </ul>

              <div className="mt-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <Button
                  onClick={triggerFileInput}
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Select Image
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-kings text-lg mb-4">Image Preview</h3>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-foreground/20 bg-foreground/5">
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Mugshot preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-foreground/60">No image selected</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.push(`/admin/dashboard/offenders/${offenderId}`)}>
                  Cancel
                </Button>
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Mugshot"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

