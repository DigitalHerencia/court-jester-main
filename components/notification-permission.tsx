"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { browserSupportsNotifications, requestNotificationPermission } from "@/lib/utils/notification-utils"

interface NotificationPermissionProps {
  onPermissionChange?: (granted: boolean) => void
}

export function NotificationPermission({ onPermissionChange }: NotificationPermissionProps) {
  const [permissionState, setPermissionState] = useState<string>("default")
  const [supported, setSupported] = useState<boolean>(false)

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = browserSupportsNotifications()
    setSupported(isSupported)

    if (isSupported && typeof Notification !== "undefined") {
      setPermissionState(Notification.permission)

      if (onPermissionChange) {
        onPermissionChange(Notification.permission === "granted")
      }
    }
  }, [onPermissionChange])

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionState(granted ? "granted" : "denied")

    if (onPermissionChange) {
      onPermissionChange(granted)
    }
  }

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your browser does not support notifications. You will receive in-app reminders instead.</p>
        </CardContent>
      </Card>
    )
  }

  if (permissionState === "granted") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>You will receive notifications for important updates and court dates.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enable Notifications
        </CardTitle>
        <CardDescription>Get timely reminders for court dates and important updates</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Court Jester can send you notifications about upcoming court dates and important case updates.
          {permissionState === "denied" &&
            " You have previously denied notification permissions. Please update your browser settings to enable notifications."}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRequestPermission}
          disabled={permissionState === "denied"}
          className="w-full bg-foreground text-background font-kings"
        >
          {permissionState === "denied" ? "NOTIFICATIONS BLOCKED" : "ENABLE NOTIFICATIONS"}
        </Button>
      </CardFooter>
    </Card>
  )
}

