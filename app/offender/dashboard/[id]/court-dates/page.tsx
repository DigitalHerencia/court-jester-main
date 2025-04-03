"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"

interface CourtDate {
  id: number
  case_id: number
  case_number: string
  date: string
  time: string
  location: string
  type: string
  notes?: string
}

export default function CourtDatesPage() {
  const { id } = useParams<{ id: string }>()
  const [courtDates, setCourtDates] = useState<CourtDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filteredDates, setFilteredDates] = useState<CourtDate[]>([])
  const [displayedDates, setDisplayedDates] = useState<CourtDate[]>([])

  useEffect(() => {
    async function fetchCourtDates() {
      try {
        const response = await fetch(`/api/offenders/${id}/court-dates`)
        if (!response.ok) {
          throw new Error("Failed to fetch court dates")
        }
        const data = await response.json()
        setCourtDates(data.courtDates || [])

        // Filter upcoming court dates (dates after today)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = (data.courtDates || []).filter(
          (courtDate: CourtDate) => new Date(courtDate.date) >= today,
        )

        // Sort by date (earliest first)
        upcoming.sort(
          (a: CourtDate, b: CourtDate) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        // Set upcoming dates as the default displayed dates
        setDisplayedDates(upcoming)
      } catch (err) {
        console.error("Error fetching court dates:", err)
        setError("Failed to load court dates. Please try again later.")
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
      // If no date is selected, show upcoming court dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = courtDates.filter((courtDate) => new Date(courtDate.date) >= today)
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setDisplayedDates(upcoming)
      setFilteredDates([])
      return
    }

    const selected = new Date(selectedDate)
    selected.setHours(0, 0, 0, 0)

    const filtered = courtDates.filter((courtDate) => {
      const dateObj = new Date(courtDate.date)
      dateObj.setHours(0, 0, 0, 0)
      return dateObj.getTime() === selected.getTime()
    })

    setFilteredDates(filtered)

    if (filtered.length > 0) {
      setDisplayedDates(filtered)
    } else {
      // If no dates match the selection, revert to upcoming dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = courtDates.filter((courtDate) => new Date(courtDate.date) >= today)
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setDisplayedDates(upcoming)
    }
  }, [selectedDate, courtDates])

  // Dates with court appearances (for calendar highlights)
  const getCourtDateHighlights = () => courtDates.map((courtDate) => new Date(courtDate.date))

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold font-kings text-background">Loading court dates...</div>
          <div className="text-foreground/60">Please wait while we fetch your court dates.</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-destructive font-kings">Error</div>
          <div className="mb-4 text-foreground/60">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      {/* Page Heading */}
      <h1 className="font-kings text-3xl text-background mb-6">Court Dates</h1>

      {/* Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Calendar */}
        <div className="card-content p-4 w-full md:w-1/2">
          <Calendar
            initialFocus
            mode="single"
            modifiers={{ highlighted: getCourtDateHighlights() }}
            modifiersClassNames={{
              highlighted: "day-highlighted",
            }}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        {/* Right Column: Court Date Details */}
        <div className="card-content p-4 w-full md:w-1/2">
          <h3 className="font-kings text-2xl text-foreground mb-3">
            {filteredDates.length > 0
              ? `Scheduled Appearances (${new Date(filteredDates[0].date).toLocaleDateString()})`
              : "All Scheduled Appearances"}
          </h3>

          {displayedDates.length === 0 ? (
            <p className="text-lg font-kings text-foreground">No court dates scheduled.</p>
          ) : (
            <div className="space-y-4 text-lg font-kings text-foreground">
              {displayedDates.map((courtDate) => (
                <div key={courtDate.id}>
                  <div className="font-bold text-xl text-foreground">
                    {new Date(courtDate.date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Case:</strong> {courtDate.case_number}
                  </div>
                  <div>
                    <strong>Time:</strong> {courtDate.time}
                  </div>
                  <div>
                    <strong>Location:</strong> {courtDate.location}
                  </div>
                  <div>
                    <strong>Type:</strong> {courtDate.type}
                  </div>
                  {courtDate.notes && (
                    <div>
                      <strong>Notes:</strong> {courtDate.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
