"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Notification {
  id: number
  title: string
  message: string
  created_at: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/admin/notifications")
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error(err)
      setError("Failed to load notifications")
      toast.error("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: number) {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      // Update the local state
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )

      toast.success("Notification marked as read")
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark notification as read")
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      // Update the local state
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      toast.success("All notifications marked as read")
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark all notifications as read")
    }
  }

  return (
    <div className="space-y-2">
      {/* Main content block */}
      <div className="card-secondary">
          <h2 className="font-kings text-3xl">Notifications</h2>
        <p className="font-kings text-background mb-2 text-sm">View and manage your system notifications.</p>
        <div className="flex justify-between items-center mb-4">
          {notifications.some((n) => !n.read) && (
            <Button
              className="bg-background text-foreground hover:bg-foreground hover:text-background"
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
          {isLoading ? (
            <p className="text-center py-4">Loading notifications...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="text-center py-4">No notifications found.</p>
          ) : (
            <div className="card-secondary space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="card-content hover:shadow-md transition-shadow"
                >
                    <div>
                      <h3 className="font-medium text-lg">{notification.title}</h3>
                      <p className="mt-1">{notification.message}</p>
                      <p className="text-sm text-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        className="border-foreground hover:bg-background hover:text-foreground"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

