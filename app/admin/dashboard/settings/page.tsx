"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface SystemSettings {
  pdf_generation: boolean
  email_notifications: boolean
  admin_code: string
  app_version: string
}

interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  from_email: string
  from_name: string
}

export default function SettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    pdf_generation: false,
    email_notifications: false,
    admin_code: "",
    app_version: "",
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    from_email: "",
    from_name: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Fetch system settings
        const systemResponse = await fetch("/api/admin/settings/system")
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system settings")
        }
        const systemData = await systemResponse.json()
        setSystemSettings(systemData.settings)

        // Fetch email settings
        const emailResponse = await fetch("/api/admin/settings/email")
        if (emailResponse.ok) {
          const emailData = await emailResponse.json()
          setEmailSettings(emailData.settings)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError("Failed to load settings. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleEmailSettingChange = (key: keyof EmailSettings, value: any) => {
    setEmailSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const saveSystemSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: systemSettings }),
      })
      if (!response.ok) {
        throw new Error("Failed to save system settings")
      }
      toast.success("System settings saved successfully")
    } catch (error) {
      console.error("Error saving system settings:", error)
      toast.error("Failed to save system settings")
    } finally {
      setIsSaving(false)
    }
  }

  const saveEmailSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: emailSettings }),
      })
      if (!response.ok) {
        throw new Error("Failed to save email settings")
      }
      toast.success("Email settings saved successfully")
    } catch (error) {
      console.error("Error saving email settings:", error)
      toast.error("Failed to save email settings")
    } finally {
      setIsSaving(false)
    }
  }

  const testEmailSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: emailSettings }),
      })
      if (!response.ok) {
        throw new Error("Failed to test email settings")
      }
      toast.success("Test email sent successfully")
    } catch (error) {
      console.error("Error testing email settings:", error)
      toast.error("Failed to send test email")
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

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error}</div>
          <Button onClick={() => window.location.reload()} className="bg-foreground text-background">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
        </TabsList>

        {/* System Settings Tab */}
        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings for the Court Jester application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pdf-generation" className="text-base">
                    PDF Generation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable PDF generation for motions and documents.
                  </p>
                </div>
                <Switch
                  id="pdf-generation"
                  checked={systemSettings.pdf_generation}
                  onCheckedChange={(checked: any) =>
                    handleSystemSettingChange("pdf_generation", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable email notifications for court dates and updates.
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={systemSettings.email_notifications}
                  onCheckedChange={(checked: any) =>
                    handleSystemSettingChange("email_notifications", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-code" className="text-base">
                  Admin Code
                </Label>
                <Input
                  id="admin-code"
                  type="text"
                  value={systemSettings.admin_code}
                  onChange={(e) => handleSystemSettingChange("admin_code", e.target.value)}
                  placeholder="Enter admin code"
                />
                <p className="text-xs text-muted-foreground">
                  This code is used for admin login. Keep it secure.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-version" className="text-base">
                  App Version
                </Label>
                <Input
                  id="app-version"
                  type="text"
                  value={systemSettings.app_version}
                  onChange={(e) => handleSystemSettingChange("app_version", e.target.value)}
                  placeholder="Enter app version"
                />
                <p className="text-xs text-muted-foreground">
                  Current version of the application.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={saveSystemSettings}
                disabled={isSaving}
                className="ml-auto bg-foreground text-background"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email server settings for notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host" className="text-base">
                    SMTP Host
                  </Label>
                  <Input
                    id="smtp-host"
                    type="text"
                    value={emailSettings.smtp_host}
                    onChange={(e) => handleEmailSettingChange("smtp_host", e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port" className="text-base">
                    SMTP Port
                  </Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) =>
                      handleEmailSettingChange("smtp_port", Number.parseInt(e.target.value))
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user" className="text-base">
                    SMTP Username
                  </Label>
                  <Input
                    id="smtp-user"
                    type="text"
                    value={emailSettings.smtp_user}
                    onChange={(e) => handleEmailSettingChange("smtp_user", e.target.value)}
                    placeholder="username@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password" className="text-base">
                    SMTP Password
                  </Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => handleEmailSettingChange("smtp_password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email" className="text-base">
                    From Email
                  </Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => handleEmailSettingChange("from_email", e.target.value)}
                    placeholder="noreply@courtjester.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name" className="text-base">
                    From Name
                  </Label>
                  <Input
                    id="from-name"
                    type="text"
                    value={emailSettings.from_name}
                    onChange={(e) => handleEmailSettingChange("from_name", e.target.value)}
                    placeholder="Court Jester"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={testEmailSettings} variant="outline" disabled={isSaving}>
                Test Connection
              </Button>
              <Button onClick={saveEmailSettings} disabled={isSaving} className="bg-foreground text-background">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
