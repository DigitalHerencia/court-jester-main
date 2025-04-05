"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

interface MotionTemplate {
  id: number
  title: string
  category: string
  created_by: string
  created_at: string
  modified_at: string
  is_template: boolean
  usage_count: number
}

export default function MotionsPage() {
  const [templates, setTemplates] = useState<MotionTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<MotionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/admin/motions")
        if (!response.ok) {
          throw new Error("Failed to fetch motion templates")
        }
        const data = await response.json()
        setTemplates(data.templates || [])
        setFilteredTemplates(data.templates || [])
      } catch (error) {
        console.error("Error fetching motion templates:", error)
        setError("Failed to load motion templates. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTemplates(templates)
      return
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const filtered = templates.filter(
      (template) =>
        template.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        template.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        template.created_by.toLowerCase().includes(lowerCaseSearchTerm),
    )
    setFilteredTemplates(filtered)
  }, [searchTerm, templates])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/motions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      // Remove the template from the state
      setTemplates((prev) => prev.filter((template) => template.id !== id))
      setFilteredTemplates((prev) => prev.filter((template) => template.id !== id))
      toast.success("Template deleted successfully")
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading motion templates...</div>
          <div className="text-foreground/60">Please wait while we fetch the motion templates.</div>
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
    <div className="space-y-3">
      {/* Header Block */}
      <div className="card-secondary space-y-3">
        <h2 className="font-kings text-3xl ">Motion Templates</h2>
        <p className="font-kings text-background mb-2 text-sm">Manage all motion templates and custom motions in the system.</p>

      {/* Search and Create Template */}
      <div className="card-content flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <Input
          className="w-full sm:w-64"
          placeholder="Search motion templates..."
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          />
        <Link href="/admin/dashboard/tools/motions-editor">
          <Button className="w-full sm:w-64 bg-foreground text-background">Create Template</Button>
        </Link>
      </div>

      {/* Templates Table */}
      {filteredTemplates.length === 0 ? (
        <div className="card-content rounded-md border border-foreground/20 p-8 text-center">
          <div className="mb-2 text-xl font-semibold">No templates found</div>
          <p className="text-foreground/60">
            {searchTerm
              ? `No templates match the search term "${searchTerm}"`
              : "There are no motion templates in the system yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-foreground/20">
          <table className="card-content w-full border-collapse">
            <thead className="bg-foreground/10">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Title</th>
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-left font-medium">Created By</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Usage</th>
                <th className="px-4 py-2 text-left font-medium">Last Modified</th>
                <th className="px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                  <td className="px-4 py-2">{template.title}</td>
                  <td className="px-4 py-2">{template.category}</td>
                  <td className="px-4 py-2">{template.created_by}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        template.is_template ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {template.is_template ? "Template" : "Custom"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{template.usage_count}</td>
                  <td className="px-4 py-2">{new Date(template.modified_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/dashboard/tools/motions-editor?id=${template.id}`}>
                        <Button size="sm" variant="default">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 text-background"
                        size="sm"
                        variant="default"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
   </div>
  )
}

