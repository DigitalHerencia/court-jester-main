// ✅ Path: app/offender/dashboard/[id]/court-dates/page.tsx

"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CourtDate {
  id: number
  case_id: number
  case_number: string
  date: string
  time: string
  type: string
  location: string
  room: string
  judge: string
  case_status: string
  created_at: string
}

export default function CourtDatesPage() {
  const { id } = useParams<{ id: string }>()
  const [courtDates, setCourtDates] = useState<CourtDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [displayDates, setDisplayDates] = useState<CourtDate[]>([])

  useEffect(() => {
    async function fetchCourtDates() {
      try {
        const res = await fetch(`/api/offenders/${id}/court-dates`)
        if (!res.ok) {
          throw new Error("Failed to fetch court dates")
        }
        const data = await res.json()
        setCourtDates(data.courtDates || [])
      } catch (err) {
        console.error("Error fetching court dates:", err)
        setError("Failed to load court dates. Please try again later.")
        toast.error("Failed to load court dates.")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) {
      fetchCourtDates()
    }
  }, [id])

  useEffect(() => {
    if (!selectedDate) {
      // No date selected – show upcoming dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = courtDates.filter(cd => new Date(cd.date) >= today)
      upcoming.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setDisplayDates(upcoming)
      return
    }
    const sel = new Date(selectedDate)
    sel.setHours(0, 0, 0, 0)
    const filtered = courtDates.filter(cd => {
      const cdDate = new Date(cd.date)
      cdDate.setHours(0, 0, 0, 0)
      return cdDate.getTime() === sel.getTime()
    })
    setDisplayDates(filtered)
  }, [selectedDate, courtDates])

  // Highlights for the Calendar (all court date days)
  const highlights = courtDates.map(cd => new Date(cd.date))

  if (isLoading) {
    return (
      <div className="mt-20 items-center">
        <div className="text-center">
          <div className="mb-4 text-3xl font-bold font-kings text-foreground">
            Loading court dates...
          </div>
          <div className="text-sm text-foreground">
            Please wait while we fetch your court dates.
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-20 items-center">
        <div className="text-center">
          <div className="mb-4 text-3xl font-bold text-foreground font-kings">
            Error
          </div>
          <div className="mb-4 text-sm text-forground">{error}</div>
          <Button variant="default" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="card-secondary">
      {/* Heading in its own content block */}
        <h2 className="text-3xl font-semibold text-background mb-4">
          Court Dates
        </h2>

      {/* Calendar in its own content block - no padding to remove gap */}
      <CardContent>
        <Calendar
          initialFocus
          aria-label="Select court date"
          className="card-content" 
          mode="single"
          modifiers={{ highlighted: highlights }}
          modifiersClassNames={{
            highlighted: "bg-foreground text-background font-bold",
          }}
          selected={selectedDate || undefined}
          onSelect={day => setSelectedDate(day as Date | null)}
        />
      </CardContent>
      <div className="card-secondary">
      {/* Appearances section in its own content block */}
        <h2 className="text-3xl tracking-wide font-semibold mb-4 text-background">
          {displayDates.length > 0
            ? `Appearances on ${new Date(displayDates[0].date).toLocaleDateString()}`
            : "Upcoming Appearances"}
        </h2>
        {displayDates.length === 0 ? (
          <div className="card-content text-center">
            <p className="text-lg font-kings text-foreground">
              No court dates scheduled.
            </p>
            <p className="text-sm text-foreground">
              When you have court appearances scheduled, they will appear here.
            </p>
            </div>
        ) : (
          <CardContent className="card-content">
            {displayDates.map(cd => (
              <div key={cd.id}>
                <h3 className="text-2xl tracking-wide font-semibold mb-2 text-foreground">
                {cd.case_number}
                </h3>
                <div className="mx-auto  grid grid-cols-3 gap-4 text-2xl">
                  <div><span className="font-bold">Time: </span>{cd.time}</div>
                  <div><span className="font-bold">Location: </span> {cd.location}</div>
                  <div><span className="font-bold">Court: </span>Room: {cd.room}</div>
                  <div><span className="font-bold">Type: </span> {cd.type}</div>
                  <div><span className="font-bold">Judge: </span> {cd.judge || "Not assigned"}</div>
                  <div><span className="font-bold">Status: </span> {cd.case_status}</div>
                </div>
                </div>
              ))}
            </CardContent>
          )
        }
        </div>
    </Card>
  )
}

