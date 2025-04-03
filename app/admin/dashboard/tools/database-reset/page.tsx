"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface TableStat {
  table_name: string
  column_count: number
  size_bytes: number
  row_count: number
}

export default function DatabaseDashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Loading...")
  const [tables, setTables] = useState<TableStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resetConfirmation, setResetConfirmation] = useState("")
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    async function fetchDatabaseInfo() {
      setIsLoading(true)
      try {
        // Fetch connection status
        const connRes = await fetch("/api/admin/database/connection", {
          credentials: "include",
        })
        const connData = await connRes.json()
        setConnectionStatus(connData.connected ? "Connected" : "Not connected")

        // Fetch table statistics
        const tablesRes = await fetch("/api/admin/database/tables", {
          credentials: "include",
        })
        const tablesData = await tablesRes.json()
        setTables(tablesData.tables || [])
      } catch (error) {
        console.error("Error fetching database info:", error)
        toast.error("Failed to fetch database information")
        setConnectionStatus("Error")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDatabaseInfo()
  }, [])

  const handleResetDatabase = async () => {
    if (resetConfirmation !== "RESET DATABASE") {
      toast.error('Confirmation text does not match. Type "RESET DATABASE" to confirm.')
      return
    }
    setIsResetting(true)
    try {
      const res = await fetch("/api/admin/database/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ confirmation: resetConfirmation }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset database")
      }
      toast.success("Database reset successfully")
      // Optionally, refetch the database info after reset
    } catch (error) {
      console.error("Error resetting database:", error)
      toast.error("Failed to reset database")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-3xl text-background mb-6">Database Dashboard</h1>
      {isLoading ? (
        <p className="text-background">Loading database information...</p>
      ) : (
        <>
          {/* Connection Status Card */}
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="font-kings text-foreground">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{connectionStatus}</p>
            </CardContent>
          </Card>

          {/* Table Statistics Card */}
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="font-kings text-foreground">Table Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {tables.length === 0 ? (
                <p className="text-foreground">No table data available.</p>
              ) : (
                <table className="w-full table-auto text-foreground">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Table Name</th>
                      <th className="px-4 py-2">Columns</th>
                      <th className="px-4 py-2">Rows</th>
                      <th className="px-4 py-2">Size (bytes)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.table_name}>
                        <td className="border px-4 py-2 text-foreground">{table.table_name}</td>
                        <td className="border px-4 py-2 text-foreground">{table.column_count}</td>
                        <td className="border px-4 py-2 text-foreground">{table.row_count}</td>
                        <td className="border px-4 py-2 text-foreground">{table.size_bytes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Reset Database Card */}
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="font-kings text-foreground">Reset Database</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-red-600">
                Warning: This action is destructive. It will drop all tables and recreate them.
              </p>
              <p className="mb-4 text-foreground">
                Type <strong>RESET DATABASE</strong> to confirm.
              </p>
              <Input
                className="bg-background text-foreground"
                placeholder='Type "RESET DATABASE" here'
                value={resetConfirmation}
                onChange={(e) => setResetConfirmation(e.target.value)}
              />
              <Button className="mt-4 button-link" disabled={isResetting} onClick={handleResetDatabase}>
                {isResetting ? "Resetting..." : "Reset Database"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
