// app/offender/dashboard/[id]/settings/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent,  CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { DeleteAccount } from "@/components/shared/delete-account"
import { NotificationPermission } from "@/components/shared/notification-permission"
import { useParams } from "next/navigation"
import { Settings } from "lucide-react"

interface NotificationPreferences {
  motion_updates: boolean
  new_cases: boolean
  system_alerts: boolean
}

interface OffenderSettings {
  email?: string
  phone?: string
  notification_preferences: NotificationPreferences
}

export default function OffenderSettingsPage() {
  const params = useParams<{ id: string }>()
  const { id } = params
  const [settings, setSettings] = useState<OffenderSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch(`/api/offenders/${id}/settings`)
        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }
        const data = await response.json()
        setSettings(data.settings)
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError("Failed to load settings. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) {
      fetchSettings()
    }
  }, [id])

  const handleInputChange = (field: string, value: string) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      notification_preferences: {
        ...settings.notification_preferences,
        [field]: value,
      },
    })
  }

  const saveSettings = async () => {
    if (!settings) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/offenders/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      if (!response.ok) {
        throw new Error("Failed to save settings")
      }
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading settings...</div>
          <div className="text-foreground/60">Please wait while we fetch your settings.</div>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load settings."}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="card-secondary">
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
        </CardHeader>
        <CardContent className="card-content space-y-4">
          <div className="border border-border rounded-lg p-4">
          <div className="mb-4">
          <h2 className="text-lg font-bold mb-2" >
            <Settings className="mr-2 inline-block h-5 w-5" />
          Manage your contact information and preferences.</h2>
          </div>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={settings.notification_preferences.motion_updates}
              id="profile_enabled"
              onCheckedChange={(checked) => handleNotificationChange("motion_updates", checked)}
            />
            <Label htmlFor="profile_enabled">Notify me about motion status updates</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.notification_preferences.new_cases}
              id="new_cases"
              onCheckedChange={(checked) => handleNotificationChange("new_cases", checked)}
            />
            <Label htmlFor="new_cases">Notify me about new cases added</Label>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Switch
              checked={settings.notification_preferences.system_alerts}
              id="system_alerts"
              onCheckedChange={(checked) => handleNotificationChange("system_alerts", checked)}
            />
            <Label htmlFor="system_alerts">Receive system alerts and updates</Label>
          </div>
          <Button className="bg-foreground text-background w-full" disabled={isSaving} onClick={saveSettings}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          </div>
            <NotificationPermission />
      <DeleteAccount offenderId={id} />
        </CardContent>
        <CardFooter className="flex justify-end">
        </CardFooter>
      </Card>
    </div>
  )
}

