"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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

    try {
      const response = await fetch("/api/offenders/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileText }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        setError(`Failed to process profile: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

      // Try to parse JSON with error handling
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing profile creation response:", parseError)
        setError("Failed to parse server response. Please try again.")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setProfileText("")

      // Redirect to mugshot upload for this offender
      if (data.offenderId) {
        router.push(`/dashboard/admin/mugshot-upload?offenderId=${data.offenderId}`)
      } else {
        setTimeout(() => {
          router.push("/dashboard/admin")
        }, 2000)
      }
    } catch (error) {
      console.error("Profile creation error", error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-4 bg-primary text-background">
        <h2 className="font-kings mb-4 text-xl">Create Offender Profile</h2>
        <p className="mb-4">
          Paste the offender profile text below. The system will parse the information and create a profile in the
          database.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste offender profile text here..."
              className="w-full p-3 border border-background/20 bg-background text-foreground font-kings min-h-[200px]"
              disabled={isLoading}
            />
            {error && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                {error}
              </p>
            )}
            {success && (
              <p className="text-background font-bold mt-2 text-center border-b border-background pb-2 font-kings">
                Profile created successfully!
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
              disabled={isLoading || !profileText.trim()}
            >
              {isLoading ? "Processing..." : "Create Profile"}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
        <h2 className="font-kings mb-4 text-xl">Example Format</h2>

        <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
          <pre className="whitespace-pre-wrap text-sm">
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
    </div>
  )
}

