"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Database, RefreshCw, Server } from "lucide-react"
import Link from "next/link"

interface DatabaseStatus {
  connected: boolean
  version: string
  message: string
}

interface DatabaseTable {
  name: string
  rows: number
  size: string
  lastUpdated: string
}

export default function DatabasePage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/admin/database/connection")
      if (!response.ok) {
        throw new Error("Failed to fetch database status")
      }
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Error fetching database status:", err)
      setError("Failed to load database status. Please try again later.")
    }
  }

  const fetchDatabaseTables = async () => {
    try {
      const response = await fetch("/api/admin/database/tables")
      if (!response.ok) {
        throw new Error("Failed to fetch database tables")
      }
      const data = await response.json()
      setTables(data.tables)
    } catch (err) {
      console.error("Error fetching database tables:", err)
      setError("Failed to load database tables. Please try again later.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchDatabaseStatus()
      await fetchDatabaseTables()
    }
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDatabaseStatus()
    await fetchDatabaseTables()
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading database information...</div>
          <div className="text-foreground/60">Please wait while we fetch the database data.</div>
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
        <h1 className="font-kings mb-2 text-xl">Database Management</h1>
        <p>View and manage database information.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background space-y-6">
        {/* Database Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Database Status</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
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

        {/* Database Tables */}
        <Tabs defaultValue="tables">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tables">Database Tables</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent className="mt-4" value="tables">
            <Card>
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
              </CardHeader>
              <CardContent>
                {tables.length === 0 ? (
                  <div className="rounded-md border border-foreground/20 p-4 text-center">
                    <p className="text-foreground/60">No tables found in the database.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-foreground/20">
                    <table className="w-full border-collapse">
                      <thead className="bg-foreground/10">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Table Name</th>
                          <th className="px-4 py-2 text-left font-medium">Rows</th>
                          <th className="px-4 py-2 text-left font-medium">Size</th>
                          <th className="px-4 py-2 text-left font-medium">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables.map((table) => (
                          <tr key={table.name} className="border-t border-foreground/10 hover:bg-foreground/5">
                            <td className="px-4 py-2">{table.name}</td>
                            <td className="px-4 py-2">{table.rows}</td>
                            <td className="px-4 py-2">{table.size}</td>
                            <td className="px-4 py-2">{table.lastUpdated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent className="mt-4" value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Database Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-foreground/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Database Reset</h3>
                    </div>
                    <p className="mb-4 text-sm text-foreground/70">
                      Reset the database to its initial state. This will delete all data and recreate the tables.
                    </p>
                    <Link href="/admin/dashboard/tools/database-reset">
                      <Button variant="destructive" className="w-full">
                        Database Reset Tool
                      </Button>
                    </Link>
                  </div>

                  <div className="rounded-md border border-foreground/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Database Backup</h3>
                    </div>
                    <p className="mb-4 text-sm text-foreground/70">
                      Create a backup of the current database state. This will download a SQL file with all data.
                    </p>
                    <Button variant="outline" className="w-full">
                      Create Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

