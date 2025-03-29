"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface Offender {
  id: number
  inmate_number: string
  first_name: string
  last_name: string
  facility: string
}

interface Case {
  id: number
  caseText: string
  created_at: string
  offender: Offender
}

interface GroupedCases {
  [offenderId: number]: {
    offender: Offender
    cases: Case[]
  }
}

export default function CasesPage() {
  const [groupedCases, setGroupedCases] = useState<GroupedCases>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Assumed endpoint returning all cases with associated offender data
      const response = await fetch("/api/admin/cases/all")
      if (!response.ok) {
        throw new Error(`Failed to fetch cases: ${response.status}`)
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch cases")
      }
      const cases: Case[] = data.cases || []
      // Group cases by offender id
      const groups: GroupedCases = cases.reduce((acc, curr) => {
        const offenderId = curr.offender.id
        if (!acc[offenderId]) {
          acc[offenderId] = { offender: curr.offender, cases: [] }
        }
        acc[offenderId].cases.push(curr)
        return acc
      }, {} as GroupedCases)
      setGroupedCases(groups)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Error fetching cases")
      toast.error(err.message || "Error fetching cases")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <h2 className="font-kings text-2xl mb-4">All Cases Organized by Inmate</h2>
      {isLoading ? (
        <p>Loading cases...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : Object.keys(groupedCases).length === 0 ? (
        <p>No cases found.</p>
      ) : (
        Object.values(groupedCases).map((group) => (
          <div key={group.offender.id} className="border border-background/20 p-4 rounded-md bg-background mb-4">
            <div className="mb-2">
              <h3 className="font-bold text-xl">
                {group.offender.first_name} {group.offender.last_name} (#{group.offender.inmate_number})
              </h3>
              <p className="text-sm">Facility: {group.offender.facility}</p>
            </div>
            <div className="space-y-2">
              {group.cases.map((c: Case) => (
                <div key={c.id} className="border border-gray-300 p-2 rounded">
                  <p className="text-sm">
                    {c.caseText.length > 100 ? c.caseText.substring(0, 100) + "..." : c.caseText}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(c.created_at).toLocaleString()}
                  </p>
                  <Link href={`/admin/dashboard/cases/${c.id}/motions`}>
                    <Button variant="outline" className="mt-2">
                      View Motions
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
