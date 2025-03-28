"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Setting {
  id: number
  key: string
  value: string
  description: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/settings")

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setSettings(data.settings || [])
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError(err instanceof Error ? err.message : "Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const toggleSetting = async (key: string, currentValue: string) => {
    try {
      // Optimistically update UI
      setSettings((prev) =>
        prev.map((setting) =>
          setting.key === key ? { ...setting, value: currentValue === "true" ? "false" : "true" } : setting,
        ),
      )

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value: currentValue === "true" ? "false" : "true",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update setting: ${response.status}`)
      }

      toast.success(`Setting updated successfully`)
    } catch (err) {
      console.error("Error updating setting:", err)
      toast.error("Failed to update setting")

      // Revert the optimistic update
      setSettings((prev) =>
        prev.map((setting) => (setting.key === key ? { ...setting, value: currentValue } : setting)),
      )
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">System Settings</h2>
        <p className="mb-2">Configure system-wide settings and features.</p>

        {isLoading ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">Loading settings...</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4 text-red-500">{error}</p>
          </div>
        ) : settings.length === 0 ? (
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <p className="text-center py-4">No settings found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex justify-between items-center rounded-md border border-background/20 p-2 bg-background text-foreground"
              >
                <div>
                  <h3 className="font-medium">{setting.description}</h3>
                  <p className="text-sm mt-1">{setting.key}</p>
                </div>
                <Button
                  className={
                    setting.value === "true"
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  }
                  onClick={() => toggleSetting(setting.key, setting.value)}
                >
                  {setting.value === "true" ? "Activated" : "Activate"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">User Settings</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <h3 className="font-medium">Admin Account</h3>
          <p className="mt-1">Username: admin</p>
          <div className="flex gap-2 mt-2">
            <Button className="bg-foreground text-background hover:bg-foreground/90">Change Password</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

