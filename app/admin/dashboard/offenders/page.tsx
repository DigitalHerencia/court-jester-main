"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

interface Offender {
  id: number
  inmate_number: string
  last_name: string
  first_name: string
  status: string
  facility: string
  created_at: string
  mugshot_url?: string
}

export default function OffendersPage() {
  const [offenders, setOffenders] = useState<Offender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchOffenders() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/offenders")

        if (!response.ok) {
          throw new Error(`Failed to fetch offenders: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setOffenders(data.offenders || [])
      } catch (err) {
        console.error("Error fetching offenders:", err)
        setError(err instanceof Error ? err.message : "Failed to load offenders")
        toast.error("Failed to load offenders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffenders()
  }, [])

  const filteredOffenders = offenders.filter((offender) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      offender.inmate_number.toLowerCase().includes(query) ||
      offender.first_name.toLowerCase().includes(query) ||
      offender.last_name.toLowerCase().includes(query)
    )
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the filter above
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Search Offenders</h2>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by number or name"
            className="flex-1 border-foreground/20 bg-background text-foreground placeholder:text-foreground/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="bg-background text-foreground hover:bg-background/90">
            Search
          </Button>
        </form>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-kings text-xl">Offender List</h2>
          <Link href="/admin/dashboard/tools/offender-profile">
            <Button className="bg-background text-foreground hover:bg-background/90">Create New Offender</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">Loading offenders...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4 text-red-500">{error}</p>
          </div>
        ) : filteredOffenders.length === 0 ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">No offenders found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOffenders.map((offender) => (
              <div
                key={offender.id}
                className="rounded-md border border-background/20 p-2 bg-background text-foreground"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="font-medium text-lg">
                      {offender.first_name} {offender.last_name}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Number:</span> {offender.inmate_number}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {offender.status || "Unknown"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Facility:</span> {offender.facility || "Unknown"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Registered:</span>{" "}
                        {new Date(offender.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Link href={`/admin/dashboard/offender/${offender.id}`}>
                      <Button className="bg-foreground text-background hover:bg-foreground/90">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

