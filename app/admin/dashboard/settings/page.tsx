"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface SystemSettings {
  email_notifications: boolean
  pdf_generation: boolean
  admin_code: string
  version: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/admin/settings/system")
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }
      const data = await res.json()
      setSettings(data.settings)
    } catch (err) {
      console.error(err)
      setError("Failed to load settings")
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  async function saveSettings() {
    if (!settings) return

    try {
      setIsSaving(true)
      const res = await fetch("/api/admin/settings/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      toast.success("Settings saved successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  function updateSetting(key: keyof SystemSettings, value: any) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  async function testEmailNotifications() {
    try {
      const res = await fetch("/api/admin/settings/email/test", {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      toast.success("Test email sent successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to send test email")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading settings...</div>
          <div className="text-foreground/60">Please wait while we fetch the system settings.</div>
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
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Title block */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">System Settings</h2>
        <p>Configure system-wide settings and preferences.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm mt-1">Enable automatic email notifications for system events</p>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testEmailNotifications}
                  disabled={!settings.email_notifications}
                >
                  Test
                </Button>
              </div>
            </div>
          </div>

          {/* PDF Generation */}
          <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">PDF Generation</h3>
                <p className="text-sm mt-1">Enable automatic PDF generation for motions and documents</p>
              </div>
              <Switch
                checked={settings.pdf_generation}
                onCheckedChange={(checked) => updateSetting("pdf_generation", checked)}
              />
            </div>
          </div>

          {/* Admin Code */}
          <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
            <div className="space-y-2">
              <h3 className="font-medium">Admin Registration Code</h3>
              <p className="text-sm">Code required for new admin registration</p>
              <div className="flex gap-2 mt-2">
                <Input
                  value={settings.admin_code}
                  onChange={(e) => updateSetting("admin_code", e.target.value)}
                  className="border-foreground/20 bg-background text-foreground"
                />
                <Button
                  variant="outline"
                  onClick={() => updateSetting("admin_code", Math.random().toString(36).substring(2, 10).toUpperCase())}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>

          {/* System Version */}
          <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">System Version</h3>
                <p className="text-sm mt-1">Current version of the Court Jester system</p>
              </div>
              <div className="text-sm font-mono bg-foreground/10 px-3 py-1 rounded">{settings.version}</div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

