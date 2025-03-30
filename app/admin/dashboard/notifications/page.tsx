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
        const response = await fetch("/api/admin/notifications", {
          credentials: "include", // Ensure cookies are sent
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch notifications")
        }
        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load notifications. Please try again later."
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to mark notification as read")
      }
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
      toast.success("Notification marked as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read"
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const response = await fetch(`/api/admin/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({ ids: unreadIds }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to mark all notifications as read")
      }
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      )
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read"
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading notifications...</div>
          <div className="text-foreground/60">
            Please wait while we fetch your notifications.
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error}</div>
          <Button
            className="bg-foreground text-background"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h1 className="font-kings text-2xl mb-2">Notifications</h1>
        <p>Review your recent notifications below.</p>
      </div>

      {/* Actions */}
      {notifications.some((n) => !n.read) && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="rounded-md border border-foreground/20 p-8 text-center">
          <div className="mb-2 text-xl font-semibold">No notifications</div>
          <p className="text-foreground/60">
            You don&apos;t have any notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-md border p-4 ${
                notification.read
                  ? "border-foreground/10 bg-foreground/5"
                  : "border-foreground/20 bg-foreground/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 font-semibold">
                    {notification.type}
                    {!notification.read && (
                      <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-foreground/80">{notification.message}</div>
                  <div className="mt-2 text-xs text-foreground/60">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(notification.id)}
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
  )
}
