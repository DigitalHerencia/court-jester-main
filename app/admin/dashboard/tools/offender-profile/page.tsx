"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OffenderProfilePage() {
  const [profileText, setProfileText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const router = useRouter()

  // If reference data is needed for profile creation, fetch it here.
  // This example assumes no external fetch is required. If needed, implement similar retry logic as in CaseUploadPage.
  useEffect(() => {
    const fetchProfileReference = async () => {
      try {
        const response = await fetch("/api/admin/offenders/profile-info")
        if (!response.ok) {
          throw new Error(`Failed to fetch profile info: ${response.status} ${response.statusText}`)
        }
        // Use the fetched data as necessary...
      } catch (err) {
        console.error("Error fetching profile info:", err)
        setFetchError("Unable to load profile reference data. Please try again later.")
      }
    }

    // Uncomment the next line if profile reference data is required.
    // fetchProfileReference()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/offenders/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText }),
      })

      if (!response.ok) {
        setError(`Failed to process profile: ${response.status} ${response.statusText}`)
        setIsLoading(false)
        return
      }

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

      if (data.offenderId) {
        router.push(`/dashboard/admin/mugshot-upload?offenderId=${data.offenderId}`)
      } else {
        setTimeout(() => router.push("/dashboard/admin"), 2000)
      }
    } catch (err) {
      console.error("Profile creation error:", err)
      setError("An error occurred. Please try again.")
    } finally {
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

        {fetchError && (
          <div className="mb-4 text-red-500">
            <p>{fetchError}</p>
            <Button className="mt-2 bg-background text-foreground hover:bg-background/90">
              Retry
            </Button>
          </div>
        )}

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
    </div>
  )
}
