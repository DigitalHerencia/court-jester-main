"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Hearing {
  id: number
  case_id: number
  case_number: string
  hearing_date: string
  hearing_time: string
  hearing_type: string
  hearing_judge: string
  court: string
  court_room: string
}

export default function OffenderCourtDatesPage({ params }: { params: { id: string } }) {
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    async function fetchHearings() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/offenders/${params.id}/hearings`)

        if (!response.ok) {
          throw new Error(`Failed to fetch hearings: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setHearings(data.hearings || [])
      } catch (err) {
        console.error("Error fetching hearings:", err)
        setError(err instanceof Error ? err.message : "Failed to load court dates")
        toast.error("Failed to load court dates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHearings()
  }, [params.id])

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        setNotificationsEnabled(true)
        toast.success("Notification permissions granted")

        // Send a test notification
        new Notification("Court Jester", {
          body: "You will now receive notifications for upcoming court dates",
          icon: "/favicon.ico",
        })
      } else {
        toast.error("Notification permissions denied")
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast.error("Failed to request notification permissions")
    }
  }

  const toggleNotifications = () => {
    if (notificationPermission === "granted") {
      setNotificationsEnabled(!notificationsEnabled)
      toast.success(notificationsEnabled ? "Notifications disabled" : "Notifications enabled")
    } else {
      requestNotificationPermission()
    }
  }

  const setReminder = (hearing: Hearing) => {
    toast.success(`Reminder set for ${new Date(hearing.hearing_date).toLocaleDateString()} at ${hearing.hearing_time}`)
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Court Dates</h2>
        <p>Manage notifications for your upcoming court dates.</p>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Notification Settings</h3>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-foreground/70">
                  Receive notifications on your device for upcoming court dates
                </p>
              </div>
              <Button
                className={
                  notificationsEnabled
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={toggleNotifications}
              >
                {notificationsEnabled ? "Enabled" : "Enable"}
              </Button>
            </div>

            {notificationPermission === "denied" && (
              <div className="p-2 bg-red-100 text-red-800 rounded-md text-sm">
                Notification permissions are blocked. Please update your browser settings to allow notifications from
                this site.
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">In-App Reminders</p>
                <p className="text-sm text-foreground/70">Receive reminders within the app when you log in</p>
              </div>
              <Button className="bg-foreground text-background hover:bg-foreground/90">Enabled</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Upcoming Court Dates</h3>

        {isLoading ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">Loading court dates...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4 text-red-500">{error}</p>
          </div>
        ) : hearings.length === 0 ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">No upcoming court dates found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {hearings
              .filter((hearing) => new Date(hearing.hearing_date) >= new Date())
              .sort((a, b) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime())
              .map((hearing) => (
                <div
                  key={hearing.id}
                  className="rounded-md border border-background/20 p-2 bg-background text-foreground"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{hearing.hearing_type}</p>
                      <p className="text-sm">Case #{hearing.case_number}</p>
                      <p className="text-sm">
                        {new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}
                      </p>
                      <p className="text-sm">
                        {hearing.court}, {hearing.court_room}
                      </p>
                      <p className="text-sm">Judge: {hearing.hearing_judge}</p>
                    </div>
                    <Button
                      className="bg-foreground text-background hover:bg-foreground/90 h-8"
                      onClick={() => setReminder(hearing)}
                    >
                      Set Reminder
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

