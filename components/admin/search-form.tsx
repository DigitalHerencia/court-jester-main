"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarInput } from "@/components/ui/sidebar"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/admin/dashboard/offenders?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <SidebarInput
        type="search"
        placeholder="Search offenders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8"
      />
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}

