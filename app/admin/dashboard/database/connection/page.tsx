"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface ConnectionStatus {
  connected: boolean
  version: string
  message: string
}

export default function DatabaseConnectionPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionString, setConnectionString] = useState("")

  useEffect(() => {
    async function fetchConnectionStatus() {
      try {
        const response = await fetch("/api/admin/database/connection")
        if (!response.ok) {
          throw new Error("Failed to fetch database connection status")
        }
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        console.error("Error fetching database connection status:", err)
        setError("Failed to load database connection status. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnectionStatus()
  }, [])

  const handleTestConnection = async () => {
    if (!connectionString.trim()) {
      toast.error("Please enter a connection string")
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch("/api/admin/database/connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionString }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to test connection")
      }

      const data = await response.json()
      setStatus(data)
      toast.success("Connection test successful")
    } catch (err) {
      console.error("Error testing connection:", err)
      toast.error(err instanceof Error ? err.message : "Failed to test connection")
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveConnection = async () => {
    if (!connectionString.trim()) {
      toast.error("Please enter a connection string")
      return
    }

    try {
      const response = await fetch("/api/admin/database/connection", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionString }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save connection")
      }

      toast.success("Connection string saved successfully")
    } catch (err) {
      console.error("Error saving connection:", err)
      toast.error(err instanceof Error ? err.message : "Failed to save connection")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading connection information...</div>
          <div className="text-foreground/60">Please wait while we fetch the connection data.</div>
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
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Top block with "font-kings" and bg-primary */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h1 className="font-kings mb-2 text-xl">Database Connection</h1>
        <p>Manage your database connection settings.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background space-y-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Connection Status</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-md border border-foreground/20 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/10">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Connection Status:</h3>
                  {status?.connected ? (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="h-4 w-4" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" /> Disconnected
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/70">
                  {status?.connected ? status.message : "Unable to connect to the database."}
                </p>
                {status?.connected && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">PostgreSQL Version:</span> {status.version}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connection-string">PostgreSQL Connection String</Label>
                <Input
                  id="connection-string"
                  type="text"
                  placeholder="postgres://username:password@hostname:port/database"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-foreground/70">
                  Format: postgres://username:password@hostname:port/database
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-1"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button onClick={handleSaveConnection} className="bg-foreground text-background">
                  Save Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Help Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium">Connection String Format</h3>
                <p className="text-sm text-foreground/70">
                  The PostgreSQL connection string should be in the following format:
                </p>
                <pre className="mt-2 rounded-md bg-foreground/10 p-2 font-mono text-sm">
                  postgres://username:password@hostname:port/database
                </pre>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Common Issues</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/70">
                  <li>Ensure the database server is running and accessible from this application</li>
                  <li>Check that the username and password are correct</li>
                  <li>Verify that the database exists and the user has appropriate permissions</li>
                  <li>Make sure the port is open and not blocked by a firewall</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Security Note</h3>
                <p className="text-sm text-foreground/70">
                  The connection string contains sensitive information. Ensure it is stored securely and not shared with
                  unauthorized individuals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

