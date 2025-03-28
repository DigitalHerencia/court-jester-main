"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function OffenderSettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: "medium",
    language: "english",
    motionGeneration: true,
    emailNotifications: false,
    pushNotifications: true,
    hearingReminders: true,
  })

  const handleToggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings({
        ...settings,
        [key]: !settings[key],
      })
      toast.success(`${key} ${!settings[key] ? "enabled" : "disabled"}`)
    }
  }

  const handleChangeSetting = (key: keyof typeof settings, value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    })
    toast.success(`${key} set to ${value}`)
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.success("Account deletion request submitted. An administrator will contact you.")
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Settings</h2>
        <p>Manage your account settings and preferences.</p>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Accessibility</h3>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-foreground/70">
                  Use a darker color scheme for better visibility in low light
                </p>
              </div>
              <Button
                className={
                  settings.darkMode
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={() => handleToggleSetting("darkMode")}
              >
                {settings.darkMode ? "Enabled" : "Enable"}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Font Size</p>
                <p className="text-sm text-foreground/70">Adjust the text size for better readability</p>
              </div>
              <select
                value={settings.fontSize}
                onChange={(e) => handleChangeSetting("fontSize", e.target.value)}
                className="p-2 border border-foreground/20 bg-background text-foreground rounded-md"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-foreground/70">Choose your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleChangeSetting("language", e.target.value)}
                className="p-2 border border-foreground/20 bg-background text-foreground rounded-md"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Features</h3>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Automatic Motion Generation</p>
                <p className="text-sm text-foreground/70">Allow the system to generate legal motions for your cases</p>
              </div>
              <Button
                className={
                  settings.motionGeneration
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={() => handleToggleSetting("motionGeneration")}
              >
                {settings.motionGeneration ? "Enabled" : "Enable"}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-foreground/70">Receive email notifications for important updates</p>
              </div>
              <Button
                className={
                  settings.emailNotifications
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={() => handleToggleSetting("emailNotifications")}
              >
                {settings.emailNotifications ? "Enabled" : "Enable"}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-foreground/70">Receive push notifications on your device</p>
              </div>
              <Button
                className={
                  settings.pushNotifications
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={() => handleToggleSetting("pushNotifications")}
              >
                {settings.pushNotifications ? "Enabled" : "Enable"}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Hearing Reminders</p>
                <p className="text-sm text-foreground/70">Receive reminders for upcoming court hearings</p>
              </div>
              <Button
                className={
                  settings.hearingReminders
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }
                onClick={() => handleToggleSetting("hearingReminders")}
              >
                {settings.hearingReminders ? "Enabled" : "Enable"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h3 className="font-kings mb-2 text-lg">Account</h3>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-foreground/70">Permanently delete your account and all associated data</p>
              </div>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

