"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, FileText, User, HelpCircle } from "lucide-react"

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
    <div className="space-y-6 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Offender Management
            </CardTitle>
            <CardDescription>Create and manage offender profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/dashboard/tools/offender-profile">
                <Button className="w-full">Create Offender Profile</Button>
              </Link>
              <Link href="/admin/dashboard/tools/mugshot-upload">
                <Button className="w-full" variant="outline">
                  Upload Mugshot
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Case Management
            </CardTitle>
            <CardDescription>Upload and process case files</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/dashboard/tools/case-upload">
              <Button className="w-full">Upload Case File</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Help Content
            </CardTitle>
            <CardDescription>Manage help content for users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/dashboard/tools/help">
              <Button className="w-full">Manage Help Content</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Status: {connectionStatus === "connected" ? "Connected" : "Error"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={checkDatabaseConnection}
                disabled={connectionStatus === "checking"}
              >
                Test Connection
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleResetDatabase}
                disabled={isResetting || connectionStatus !== "connected"}
              >
                {isResetting ? "Resetting..." : "Reset & Seed Database"}
              </Button>
            </div>
            {connectionError && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm">{connectionError}</div>
            )}
            {resetResult && (
              <div
                className={`mt-2 p-2 rounded-md text-sm ${resetResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {resetResult.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {tableCounts && (
        <Card>
          <CardHeader>
            <CardTitle>Database Statistics</CardTitle>
            <CardDescription>Current record counts in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Users</p>
                <p className="text-2xl font-bold">{tableCounts.users || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Offenders</p>
                <p className="text-2xl font-bold">{tableCounts.offenders || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Cases</p>
                <p className="text-2xl font-bold">{tableCounts.cases || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Motions</p>
                <p className="text-2xl font-bold">{tableCounts.motions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

