"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileEdit, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Define the motion template type as stored in the database
interface MotionTemplate {
  id: number
  title: string
  content: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function MotionsEditorPage() {
  const [templates, setTemplates] = useState<MotionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MotionTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTemplate, setEditedTemplate] = useState<{
    id?: number
    title: string
    category: string
    content: string
  }>({
    title: "",
    category: "",
    content: "",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch templates from the database API on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/admin/motions", { credentials: "include" })
        if (!res.ok) {
          throw new Error("Failed to fetch motion templates")
        }
        const data = await res.json()
        setTemplates(data.templates || [])
      } catch (error) {
        console.error("Error fetching motion templates:", error)
        toast.error("Failed to load motion templates")
      }
    }
    fetchTemplates()
  }, [])

  const handleSelectTemplate = (template: MotionTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(false)
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setEditedTemplate({
      title: "",
      category: "",
      content: "",
    })
    setIsEditing(true)
  }

  const handleEditTemplate = () => {
    if (!selectedTemplate) return
    setEditedTemplate({
      id: selectedTemplate.id,
      title: selectedTemplate.title,
      category: selectedTemplate.category,
      content: selectedTemplate.content,
    })
    setIsEditing(true)
  }

  const handleSaveTemplate = async () => {
    if (!editedTemplate.title || !editedTemplate.category || !editedTemplate.content) {
      toast.error("Please fill out all fields")
      return
    }
    setIsSaving(true)
    try {
      if (editedTemplate.id) {
        // Update existing template
        const res = await fetch(`/api/admin/motion_templates/${editedTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editedTemplate),
        })
        if (!res.ok) {
          throw new Error("Failed to update template")
        }
        const updatedTemplate = await res.json()
        setTemplates((prev) => prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)))
        setSelectedTemplate(updatedTemplate)
        toast.success("Template updated successfully")
      } else {
        // Create new template
        const res = await fetch(`/api/admin/motion_templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editedTemplate),
        })
        if (!res.ok) {
          throw new Error("Failed to create template")
        }
        const newTemplate = await res.json()
        setTemplates((prev) => [...prev, newTemplate])
        setSelectedTemplate(newTemplate)
        toast.success("Template created successfully")
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error("Failed to save template")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return
    try {
      const res = await fetch(`/api/admin/motion_templates/${selectedTemplate.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to delete template")
      }
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id))
      setSelectedTemplate(null)
      setIsDeleteDialogOpen(false)
      toast.success("Template deleted successfully")
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (selectedTemplate) {
      setEditedTemplate({
        id: selectedTemplate.id,
        title: selectedTemplate.title,
        category: selectedTemplate.category,
        content: selectedTemplate.content,
      })
    } else {
      setEditedTemplate({
        title: "",
        category: "",
        content: "",
      })
    }
  }

  // Helper: Extract variables from template content (text between curly braces)
  const extractVariables = (content: string) => {
    const matches = content.match(/{([^}]+)}/g) || []
    return matches.map((match) => match.slice(1, -1))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Motions Editor</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Motion Templates</CardTitle>
            <CardDescription>Select a template to edit or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
              <div className="space-y-2 mt-4">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    className="w-full justify-start"
                    variant={selectedTemplate?.id === template.id ? "default" : "ghost"}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          {isEditing ? (
            <>
              <CardHeader>
                <CardTitle>{editedTemplate.id ? "Edit Template" : "Create New Template"}</CardTitle>
                <CardDescription>
                  {editedTemplate.id ? "Modify the existing template" : "Create a new motion template"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Motion for Discovery"
                      value={editedTemplate.title}
                      onChange={(e) => setEditedTemplate((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editedTemplate.category}
                      onValueChange={(value) => setEditedTemplate((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bail">Bail</SelectItem>
                        <SelectItem value="dismissal">Dismissal</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="counsel">Counsel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Template Content</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Use {"{variable_name}"} for dynamic content (e.g., {"{defendant_name}"})
                    </p>
                    <Textarea
                      className="min-h-[300px] font-mono"
                      id="content"
                      placeholder="Enter the motion template content..."
                      value={editedTemplate.content}
                      onChange={(e) => setEditedTemplate((prev) => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button disabled={isSaving} onClick={handleSaveTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Template"}
                </Button>
              </CardFooter>
            </>
          ) : selectedTemplate ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTemplate.title}</CardTitle>
                    <CardDescription>
                      Category: {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleEditTemplate}>
                      Edit
                    </Button>
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the &quot;{selectedTemplate.title}&quot; template? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteTemplate}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Template
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Template Information</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Created: {formatDate(selectedTemplate.created_at)}</p>
                      <p>Last Updated: {formatDate(selectedTemplate.updated_at)}</p>
                      <p>Variables: {extractVariables(selectedTemplate.content).join(", ")}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Template Content</h3>
                    <div className="whitespace-pre-wrap border rounded-md p-4 bg-muted/30 text-sm">
                      {selectedTemplate.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
              <p className="text-sm text-muted-foreground mb-4">Select a template from the list or create a new one</p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

