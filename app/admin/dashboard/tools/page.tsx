"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TableCounts {
  [key: string]: number
}

export default function AdminToolsPage() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [tableCounts, setTableCounts] = useState<TableCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  async function checkDatabaseConnection() {
    try {
      setIsLoading(true)
      setConnectionStatus("checking")

      try {
        // Check database connection
        const connectionResponse = await fetch("/api/admin/database/connection")

        if (!connectionResponse.ok) {
          throw new Error(`Failed to check database connection: ${connectionResponse.status}`)
        }

        const connectionData = await connectionResponse.json()

        if (connectionData.success) {
          setConnectionStatus("connected")

          try {
            // Get table counts
            const countsResponse = await fetch("/api/admin/database/tables")

            if (!countsResponse.ok) {
              throw new Error(`Failed to get table counts: ${countsResponse.status}`)
            }

            const countsData = await countsResponse.json()
            setTableCounts(countsData.counts || {})
          } catch (countsError) {
            console.error("Error getting table counts:", countsError)
            toast.error("Failed to get table counts")
          }
        } else {
          setConnectionStatus("error")
          setConnectionError(connectionData.error || "Unknown error")
        }
      } catch (connectionError) {
        console.error("Database connection error:", connectionError)
        setConnectionStatus("error")
        setConnectionError(connectionError instanceof Error ? connectionError.message : "Unknown error")
      }
    } catch (err) {
      console.error("Error in database status component:", err)
      setConnectionStatus("error")
      setConnectionError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setConnectionStatus("checking")
      setConnectionError(null)

      const response = await fetch("/api/admin/database/connection")

      if (!response.ok) {
        throw new Error(`Failed to check database connection: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setConnectionStatus("connected")
        toast.success("Database connection successful")
      } else {
        setConnectionStatus("error")
        setConnectionError(data.error || "Unknown error")
        toast.error("Database connection failed")
      }
    } catch (err) {
      console.error("Database connection test error:", err)
      setConnectionStatus("error")
      setConnectionError(err instanceof Error ? err.message : "Unknown error")
      toast.error(`Database connection error: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleResetDatabase = async () => {
    if (
      !confirm(
        "WARNING: This will delete all data and recreate the database schema. Are you sure you want to continue?",
      )
    ) {
      return
    }

    try {
      setIsResetting(true)
      setResetResult(null)

      const response = await fetch("/api/admin/database/reset", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to reset database: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResetResult({
          success: true,
          message: "Database reset and seeded successfully",
        })
        toast.success("Database reset and seeded successfully")
        // Refresh the connection status and table counts
        await checkDatabaseConnection()
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (err) {
      console.error("Database reset error:", err)
      setResetResult({
        success: false,
        message: `Failed to reset database: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
      toast.error(`Failed to reset database: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Admin Tools</h2>
        <p className="mb-2">Use these tools to manage offender profiles, cases, and mugshots.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Link href="/dashboard/admin/tools/offender-profile">
            <Button className="w-full bg-background text-foreground hover:bg-background/90">
              Create Offender Profile
            </Button>
          </Link>

          <Link href="/dashboard/admin/tools/case-upload">
            <Button className="w-full bg-background text-foreground hover:bg-background/90">Upload Case File</Button>
          </Link>

          <Link href="/dashboard/admin/tools/mugshot-upload">
            <Button className="w-full bg-background text-foreground hover:bg-background/90">Upload Mugshot</Button>
          </Link>

          <Link href="/dashboard/admin/tools/help">
            <Button className="w-full bg-background text-foreground hover:bg-background/90">Manage Help Content</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Database Status</h2>

        <div className="space-y-2">
          <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
            <h3 className="font-medium">Connection Status</h3>
            <p className="mt-1">
              Status:{" "}
              {connectionStatus === "checking"
                ? "Checking database connection..."
                : connectionStatus === "connected"
                  ? "Connected"
                  : "Connection Error"}
            </p>
            <p className="mt-1">Provider: Neon Postgres</p>

            {connectionStatus === "error" && connectionError && <p className="mt-2 text-red-500">{connectionError}</p>}

            <div className="mt-2 flex gap-2">
              <Button
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={handleTestConnection}
                disabled={connectionStatus === "checking"}
              >
                {connectionStatus === "checking" ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Database Reset Tool</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <p className="mb-4">
            This tool will delete all data in the database and recreate the schema with sample data. Use this only for
            development or when you need to start fresh.
          </p>

          <div className="bg-red-600 text-white p-2 rounded-md mb-4">
            <h3 className="font-bold">WARNING</h3>
            <p>This action cannot be undone. All existing data will be permanently deleted.</p>
          </div>

          {resetResult && (
            <div className={`p-2 rounded-md mb-4 ${resetResult.success ? "bg-green-600" : "bg-red-600"} text-white`}>
              <p>{resetResult.message}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleResetDatabase}
              disabled={isResetting || connectionStatus !== "connected"}
            >
              {isResetting ? "Resetting Database..." : "Reset & Seed Database"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Table Statistics</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-medium">Users</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.users || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Offenders</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.offenders || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Cases</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.cases || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Charges</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.charges || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Hearings</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.hearings || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Motions</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.motions || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Reminders</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.reminders || 0 : "Error loading count"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="mt-1">
                {isLoading ? "Checking count..." : tableCounts ? tableCounts.notifications || 0 : "Error loading count"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Recent Activity</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <p>No recent activity found.</p>
        </div>
      </div>
    </div>
  )
}

