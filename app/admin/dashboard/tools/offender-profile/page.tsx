"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"

export default function OffenderProfilePage() {
  const [profileText, setProfileText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    if (!profileText.trim()) {
      setError("Profile text is required")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/admin/offenders/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileText }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process profile: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSuccess(true)
      setProfileText("")
      toast.success("Offender profile created successfully")

      // Redirect to mugshot upload for this offender
      if (data.offenderId) {
        router.push(`/admin/dashboard/tools/mugshot-upload?offenderId=${data.offenderId}`)
      } else {
        setTimeout(() => {
          router.push("/admin/dashboard/offenders")
        }, 2000)
      }
    } catch (error) {
      console.error("Profile creation error", error)
      setError("An error occurred. Please try again.")
      toast.error("Failed to create offender profile")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Offender Profile</CardTitle>
          <CardDescription>
            Paste the offender profile text below. The system will parse the information and create a profile in the
            database.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="Paste offender profile text here..."
                className="min-h-[300px] font-mono"
                disabled={isLoading}
              />

              {error && (
                <div className="flex items-center p-3 text-sm bg-red-50 border border-red-200 text-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center p-3 text-sm bg-green-50 border border-green-200 text-green-800 rounded-md">
                  Profile created successfully!
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md">
                <h3 className="font-semibold mb-2">Example Format</h3>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {`Details
Offender ID: 468079
NMCD Number: 
Last Name: Dominguez
First Name: Christopher
Middle Name: 
Offender Status: INACTIVE
Facility/Region: 
Demographics
Age: 42
Height: 5 ft 10 in
Weight: 168
Eye Color: Brown
Hair: Brown or Dark Brown
Religion: 
Education: 
Complexion: 
Ethnicity: Hispanic
Alias: No Alias Found
Current Offense(s)
No Offenses Found
Past Offense(s)
Offense Status
Burglary (automobile) - conspiracy [ D-0307-CR-2008-1281 ] Completed
Burglary (automobile) [ D-0307-CR-2008-1281 ] Completed`}
                </pre>
              </div>
            </div>
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
            <Button type="submit" disabled={isLoading || !profileText.trim()}>
              {isLoading ? "Processing..." : "Create Profile"}
              {!isLoading && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

