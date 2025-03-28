"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Notification {
  id: number
  type: string
  message: string
  created_at: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/notifications")

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError(err instanceof Error ? err.message : "Failed to load notifications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`)
      }

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )

      toast.success("Notification marked as read")
    } catch (err) {
      console.error("Error marking notification as read:", err)
      toast.error("Failed to mark notification as read")
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Notification List</h2>

        {isLoading ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4 text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-md border border-background/20 p-2 bg-background text-foreground ${notification.read ? "opacity-70" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {notification.type === "registration" && "New Offender Registration"}
                      {notification.type === "hearing" && "Hearing Scheduled"}
                      {notification.type === "motion" && "Motion Filed"}
                      {!["registration", "hearing", "motion"].includes(notification.type) && "Notification"}
                    </h3>
                    <p className="mt-1">{notification.message}</p>
                    <p className="text-sm text-foreground/70 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      className="border-foreground/20 hover:bg-background hover:text-foreground"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

