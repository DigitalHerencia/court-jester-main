"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { AlertCircle, ArrowLeft, Camera, Save } from "lucide-react"

interface Offender {
  id: number
  inmate_number: string
  last_name: string
  first_name: string
}

export default function MugshotUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [offenderId, setOffenderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [offenders, setOffenders] = useState<Offender[]>([])
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

      const response = await fetch(`/api/admin/offenders/${offenderId}/mugshot`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload mugshot: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSuccess(true)
      setSelectedFile(null)
      setPreviewUrl(null)
      toast.success("Mugshot uploaded successfully!")

      // Redirect back to admin dashboard
      setTimeout(() => {
        router.push("/admin/dashboard/offenders")
      }, 2000)
    } catch (error) {
      console.error("Mugshot upload error", error)
      setError("An error occurred. Please try again.")
      toast.error("Failed to upload mugshot")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Upload Mugshot
          </CardTitle>
          <CardDescription>
            Upload a mugshot image for an offender. The image will be stored in Vercel Blob and associated with the
            offender's profile.
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
              <Label htmlFor="mugshotFile">Upload Mugshot</Label>
              <Input
                id="mugshotFile"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            {previewUrl && (
              <div className="flex justify-center mt-4">
                <div className="relative w-48 h-64 border-2 border-muted">
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
              <div className="flex items-center p-3 text-sm bg-red-50 border border-red-200 text-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center p-3 text-sm bg-green-50 border border-green-200 text-green-800 rounded-md">
                Mugshot uploaded successfully!
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/tools")}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile || !offenderId}>
              {isLoading ? "Uploading..." : "Upload Mugshot"}
              {!isLoading && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

