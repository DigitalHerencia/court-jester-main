// app/offender/dashboard/[id]/court-dates/page.tsx

"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CourtDateMessage {
  id: number
  message: string
  created_at: string
  is_read: boolean
}

interface CourtDate {
  id: number
  case_id: number
  case_number: string
  date: string
  time: string
  type: string
  location: string
  judge: string
  case_status: string
  created_at: string
  messages?: CourtDateMessage[]
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

        // Filter and sort upcoming court dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = (data.courtDates || []).filter(
          (courtDate: CourtDate) => new Date(courtDate.date) >= today
        )

        upcoming.sort(
          (a: CourtDate, b: CourtDate) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

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
      // Show upcoming court dates if no date selected
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = courtDates.filter(
        (courtDate) => new Date(courtDate.date) >= today
      )
      upcoming.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
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
    setDisplayedDates(filtered)
  }, [selectedDate, courtDates])

  // Get dates for calendar highlights
  const getCourtDateHighlights = () =>
    courtDates.map((courtDate) => new Date(courtDate.date))

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-3xl font-bold font-kings text-background">
            Loading court dates...
          </div>
          <div className="text-sm text-background/60">
            Please wait while we fetch your court dates.
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-3xl font-bold text-destructive font-kings">
            Error
          </div>
          <div className="mb-4 text-sm text-background/60">{error}</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="text-3xl font-bold font-kings text-background mb-6">
        Court Dates
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="card-content p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Calendar
            </h2>
            <Calendar
              initialFocus
              aria-label="Select court date"
              className="mx-auto rounded-md border"
              mode="single"
              modifiers={{ highlighted: getCourtDateHighlights() }}
              modifiersClassNames={{
                highlighted: "bg-primary/40 text-foreground font-bold border border-primary/30",
              }}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="card-content p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {filteredDates.length > 0
                ? `Appearances on ${new Date(filteredDates[0].date).toLocaleDateString()}`
                : "Upcoming Appearances"}
            </h2>

            {displayedDates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-kings text-foreground">
                  No court dates scheduled.
                </p>
                <p className="text-sm text-foreground/60 mt-2">
                  When you have court appearances scheduled, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayedDates.map((courtDate) => (
                  <Card key={courtDate.id}>
                    <CardContent className="card-content p-4">
                      <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {new Date(courtDate.date).toLocaleDateString()}
                      </h3>
                      <dl className="grid gap-2 text-sm">
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Case Number:</dt>
                          <dd className="col-span-2">{courtDate.case_number}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Time:</dt>
                          <dd className="col-span-2">
                            {new Date(`1970-01-01T${courtDate.time}`).toLocaleTimeString(
                              [],
                              { hour: "numeric", minute: "2-digit" }
                            )}
                          </dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Location:</dt>
                          <dd className="col-span-2">{courtDate.location}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Type:</dt>
                          <dd className="col-span-2">{courtDate.type}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Judge:</dt>
                          <dd className="col-span-2">{courtDate.judge || "Not assigned"}</dd>
                        </div>
                        <div className="grid grid-cols-3">
                          <dt className="font-medium">Status:</dt>
                          <dd className="col-span-2">{courtDate.case_status}</dd>
                        </div>
                      </dl>
                      
                      {courtDate.messages && courtDate.messages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="font-medium mb-2">Messages</h4>
                          <div className="space-y-2">
                            {courtDate.messages.map((message) => (
                              <div key={message.id} className="text-sm bg-background/5 p-3 rounded">
                                <p className="text-foreground">{message.message}</p>
                                <p className="text-xs text-foreground/60 mt-1">
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
