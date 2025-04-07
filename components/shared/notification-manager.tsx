"use client"

import { useEffect, useState } from "react"
import { NotificationPermission } from "./notification-permission"
import { toast } from "sonner"
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  scheduleCourtDateNotifications,
  sendNotification,
} from "@/lib/utils/notification-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NotificationPreferences {
  court_date: boolean
  motion_status: boolean
  system: boolean
  warning: boolean
  reminder: boolean
}

interface NotificationManagerProps {
  offenderId: string
  courtDates?: Array<{
    id: number
    date: string
    title: string
  }>
}

export function NotificationManager({ offenderId, courtDates = [] }: NotificationManagerProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const prefs = loadNotificationPreferences();
    return {
      court_date: prefs.court_date,
      motion_status: prefs.motion_status,
      system: prefs.system,
      warning: prefs.warning,
      reminder: prefs.reminder
    }
  })
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Schedule notifications for upcoming court dates when permissions are granted
    if (permissionGranted && preferences.court_date) {
      courtDates.forEach(hearing => {
        const hearingDate = new Date(hearing.date)
        if (hearingDate > new Date()) {
          scheduleCourtDateNotifications(
            hearing.id,
            hearing.title,
            hearingDate,
            {
              data: { offenderId }
            }
          )
        }
      })
    }
  }, [permissionGranted, preferences.court_date, courtDates, offenderId])

  const handlePermissionChange = (granted: boolean) => {
    setPermissionGranted(granted)
    if (granted) {
      toast.success("Notifications enabled")
      // Send a test notification
      sendNotification("system", "Notifications enabled", {
        body: "You will now receive important updates about your cases."
      })
    }
  }

  const handlePreferenceChange = (type: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [type]: !preferences[type]
    }
    setPreferences(newPreferences)
    saveNotificationPreferences(newPreferences)

    // Show confirmation
    toast.success(`${type.replace('_', ' ')} notifications ${newPreferences[type] ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="space-y-4">
      <NotificationPermission onPermissionChange={handlePermissionChange} />

      {permissionGranted && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.court_date}
                    id="court_date"
                    onCheckedChange={() => handlePreferenceChange("court_date")}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="court_date">
                    Court Date Reminders (7 days, 3 days, and day before)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.motion_status}
                    id="motion_status"
                    onCheckedChange={() => handlePreferenceChange("motion_status")}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="motion_status">
                    Motion Status Updates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.system}
                    id="system"
                    onCheckedChange={() => handlePreferenceChange("system")}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="system">
                    System Notifications
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.warning}
                    id="warning"
                    onCheckedChange={() => handlePreferenceChange("warning")}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="warning">
                    Important Reminders and Warnings
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={preferences.reminder}
                    id="reminder"
                    onCheckedChange={() => handlePreferenceChange("reminder")}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="reminder">
                    General Reminders
                  </label>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )}