"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

interface Offender {
  id: number
  inmate_number: string
  last_name: string
  first_name: string
  status: string
  facility: string
  created_at: string
  mugshot_url?: string
}

interface PaginationData {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export default function OffendersPage() {
  const [offenders, setOffenders] = useState<Offender[]>([])
  const [filteredOffenders, setFilteredOffenders] = useState<Offender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchOffenders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.limit, pagination.offset])

  async function fetchOffenders() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/offenders?limit=${pagination.limit}&offset=${pagination.offset}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch offenders")
      }
      const data = await response.json()
      setOffenders(data.offenders || [])
      setFilteredOffenders(data.offenders || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching offenders:", error)
      setError(error instanceof Error ? error.message : "Failed to load offenders. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOffenders(offenders)
      return
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const filtered = offenders.filter(
      (offender) =>
        offender.inmate_number.toLowerCase().includes(lowerCaseSearchTerm) ||
        offender.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        offender.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        offender.facility?.toLowerCase().includes(lowerCaseSearchTerm),
    )
    setFilteredOffenders(filtered)
  }, [searchTerm, offenders])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      // Reset to normal pagination if search is cleared
      setPagination((prev) => ({ ...prev, offset: 0 }))
      return fetchOffenders()
    }
    try {
      setIsSearching(true)
      const response = await fetch(`/api/admin/offenders/search?q=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to search offenders")
      }
      const data = await response.json()
      setOffenders(data.offenders || [])
      setFilteredOffenders(data.offenders || [])
      // Update pagination for search results
      setPagination({
        total: data.offenders?.length || 0,
        limit: data.offenders?.length || 0,
        offset: 0,
        hasMore: false,
      })
    } catch (error) {
      console.error("Error searching offenders:", error)
      toast.error(error instanceof Error ? error.message : "Failed to search offenders")
    } finally {
      setIsSearching(false)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }))
    }
  }

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && !isSearching) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading offenders...</div>
          <div className="text-foreground/60">Please wait while we fetch the offender data.</div>
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
          <Button className="bg-foreground text-background" onClick={() => fetchOffenders()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offenders</h1>
        <div className="flex items-center gap-2">
          <form className="flex gap-2" onSubmit={handleSearch}>
            <Input
              className="w-64"
              placeholder="Search offenders..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button disabled={isSearching} type="submit" variant="outline">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          <Link href="/admin/dashboard/tools/offender-profile">
            <Button className="bg-foreground text-background">Add Offender</Button>
          </Link>
        </div>
      </div>

      {/* Offenders Table or Empty State */}
      {filteredOffenders.length === 0 ? (
        <div className="rounded-md border border-foreground/20 p-8 text-center">
          <div className="mb-2 text-xl font-semibold">No offenders found</div>
          <p className="text-foreground/60">
            {searchTerm
              ? `No offenders match the search term "${searchTerm}"`
              : "There are no offenders in the system yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-foreground/20">
            <table className="w-full border-collapse">
              <thead className="bg-foreground/10">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Inmate #</th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Facility</th>
                  <th className="px-4 py-2 text-left font-medium">Added</th>
                  <th className="px-4 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffenders.map((offender) => (
                  <tr key={offender.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                    <td className="px-4 py-2">{offender.inmate_number}</td>
                    <td className="px-4 py-2">
                      {offender.last_name}, {offender.first_name}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          offender.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {offender.status.charAt(0).toUpperCase() + offender.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{offender.facility || "N/A"}</td>
                    <td className="px-4 py-2">{formatDate(offender.created_at)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Link href={`/admin/dashboard/offenders/${offender.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/dashboard/tools/mugshot-upload?id=${offender.id}`}>
                          <Button size="sm" variant="outline">
                            Mugshot
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!searchTerm && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to{" "}
                {Math.min(pagination.offset + filteredOffenders.length, pagination.total)} of {pagination.total} offenders
              </div>
              <div className="flex gap-2">
                <Button disabled={pagination.offset === 0} variant="outline" onClick={handlePreviousPage}>
                  Previous
                </Button>
                <Button disabled={!pagination.hasMore} variant="outline" onClick={handleNextPage}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
