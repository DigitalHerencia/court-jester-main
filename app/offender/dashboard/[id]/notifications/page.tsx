"use client"
import { useParams } from "next/navigation"

import { useState, useEffect } from "react"
import { Bell, Calendar, FileText, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Notification {
  id: number
  type: string
  message: string
  read: boolean
  created_at: string
}

export default function OffenderNotificationsPage() {
  const { id } = useParams<{ id: string }>()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch(`/api/offenders/${id}/notifications`)
        if (!response.ok) {
          throw new Error("Failed to fetch notifications")
        }
        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast.error("Failed to load notifications")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) {
      fetchNotifications()
    }
  }, [id])

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/offenders/${id}/notifications/${notificationId}/read`, { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
      toast.success("Notification marked as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to mark notification as read")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "court_date":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "motion_status":
        return <FileText className="h-5 w-5 text-green-500" />
      case "system":
        return <Info className="h-5 w-5 text-gray-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading notifications...</div>
          <div className="text-foreground/60">Please wait while we fetch your notifications.</div>
        </div>
      </div>
    )
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Tabs defaultValue="unread">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value="unread">
          {unreadNotifications.length === 0 ? (
            <p>No unread notifications.</p>
          ) : (
            unreadNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium capitalize">{notification.type.replace("_", " ")}</span>
                  </div>
                  {!notification.read && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                      Mark as Read
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="read">
          {readNotifications.length === 0 ? (
            <p>No read notifications.</p>
          ) : (
            readNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <span className="font-medium capitalize">{notification.type.replace("_", " ")}</span>
                </CardHeader>
                <CardContent>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

