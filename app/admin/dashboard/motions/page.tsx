"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Motion {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  offenderName: string
  judge?: string
  venue?: string
}

export default function AdminMotionsPage() {
  const [motions, setMotions] = useState<Motion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMotions() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/admin/motions")
        if (!response.ok) {
          throw new Error(`Failed to fetch motions: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setMotions(data.motions || [])
      } catch (err) {
        console.error("Error fetching motions:", err)
        setError(err instanceof Error ? err.message : "Failed to load motions")
        toast.error("Failed to load motions")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMotions()
  }, [])

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-4 bg-primary text-background">
        <h2 className="font-kings text-xl mb-2">Motions Management</h2>
        <p>This section displays motions auto-populated from cases and profiles. You can edit any motion to adjust template details.</p>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
          <p className="text-center py-4">Loading motions...</p>
        </div>
      ) : error ? (
        <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
          <p className="text-center py-4 text-red-500">{error}</p>
        </div>
      ) : motions.length === 0 ? (
        <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
          <p className="text-center py-4">No motions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {motions.map((motion) => (
            <div key={motion.id} className="rounded-md border border-background/20 p-4 bg-background text-foreground">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="font-medium text-lg">{motion.title}</h3>
                  <p className="text-sm mt-1">
                    Offender: {motion.offenderName} {motion.judge && `| Judge: ${motion.judge}`} {motion.venue && `| Venue: ${motion.venue}`}
                  </p>
                  <p className="text-xs text-foreground/70 mt-1">Last Updated: {new Date(motion.updated_at).toLocaleString()}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <Link href={`/admin/dashboard/motions/editor/${motion.id}`}>
                    <Button className="bg-background text-foreground hover:bg-background/90">Edit Motion</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optional: Additional section for motion history */}
      <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
        <h2 className="font-kings text-xl mb-2">Motion History</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <p className="text-center">Motion history details would be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
