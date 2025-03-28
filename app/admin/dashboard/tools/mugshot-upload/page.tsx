"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

export default function MugshotUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [offenderId, setOffenderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [offenders, setOffenders] = useState<any[]>([])
  const [isLoadingOffenders, setIsLoadingOffenders] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get offenderId from query params if available
  useEffect(() => {
    const id = searchParams.get("offenderId")
    if (id) {
      setOffenderId(id)
    }
  }, [searchParams])

  // Fetch offenders on component mount
  useEffect(() => {
    const fetchOffenders = async () => {
      setIsLoadingOffenders(true)
      try {
        const response = await fetch("/api/offenders")

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          console.error("Failed to fetch offenders:", response.status, response.statusText)
          setIsLoadingOffenders(false)
          return
        }

        // Try to parse JSON with error handling
        let data
        try {
          data = await response.json()
        } catch (parseError) {
          console.error("Error parsing offenders response:", parseError)
          setIsLoadingOffenders(false)
          return
        }

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
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !offenderId) {
      setError("Please select an offender and upload a mugshot")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("mugshot", selectedFile)

      const response = await fetch(`/api/offenders/${offenderId}/mugshot`, {
        method: "POST",
        body: formData,
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        setError(`Failed to upload mugshot: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      // Try to parse JSON with error handling
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing mugshot upload response:", parseError)
        setError("Failed to parse server response. Please try again.")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setSelectedFile(null)
      setPreviewUrl(null)

      // Redirect back to admin dashboard
      setTimeout(() => {
        router.push("/dashboard/admin")
      }, 2000)
    } catch (error) {
      console.error("Mugshot upload error", error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-4 bg-primary text-background">
        <h2 className="font-kings mb-4 text-xl">Upload Mugshot</h2>
        <p className="mb-4">
          Upload a mugshot image for an offender. The image will be stored in Vercel Blob and associated with the
          offender's profile.
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
            <label className="block mb-2 font-kings">Upload Mugshot</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="w-full p-3 border border-background/20 bg-background text-foreground font-kings"
              disabled={isLoading}
            />

            {previewUrl && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-48 h-64 border-2 border-background">
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Mugshot preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                {error}
              </p>
            )}
            {success && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                Mugshot uploaded successfully!
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-background/20 hover:bg-background hover:text-foreground bg-foreground text-background"
              onClick={() => router.push("/dashboard/admin")}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-background text-foreground hover:bg-background/90"
              disabled={isLoading || !selectedFile || !offenderId}
            >
              {isLoading ? "Uploading..." : "Upload Mugshot"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

