"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileEdit, Plus, Save, Trash2, FileText, Check } from "lucide-react"
import { toast } from "sonner"

// Define the motion template type
interface MotionTemplate {
  id: number
  title: string
  content: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  variables?: string[]
}

// Define the case type
interface Case {
  id: number
  case_number: string
  court: string
  judge: string
  status: string
  offender_id: number
  offender_name: string
}

// Define the offender type
interface Offender {
  id: number
  inmate_number: string
  first_name: string
  last_name: string
  middle_name?: string
  facility?: string
}

export default function MotionsEditorPage() {
  const searchParams = useSearchParams()
  const caseId = searchParams.get("caseId")
  const templateId = searchParams.get("templateId")

  const [activeTab, setActiveTab] = useState<string>("templates")
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

  // Motion generation states
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [offender, setOffender] = useState<Offender | null>(null)
  const [motionVariables, setMotionVariables] = useState<Record<string, string>>({})
  const [generatedMotion, setGeneratedMotion] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch templates from the database API on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/admin/motions/templates", { credentials: "include" })
        if (!res.ok) {
          throw new Error("Failed to fetch motion templates")
        }
        const data = await res.json()
        setTemplates(data.templates || [])

        // If templateId is provided, select that template
        if (templateId) {
          const template = data.templates.find((t: MotionTemplate) => t.id === Number(templateId))
          if (template) {
            setSelectedTemplate(template)
            setActiveTab("generate")
          }
        }
      } catch (error) {
        console.error("Error fetching motion templates:", error)
        toast.error("Failed to load motion templates")
      }
    }

    async function fetchCases() {
      try {
        const res = await fetch("/api/admin/cases", { credentials: "include" })
        if (!res.ok) {
          throw new Error("Failed to fetch cases")
        }
        const data = await res.json()
        setCases(data.cases || [])

        // If caseId is provided, select that case
        if (caseId) {
          const caseData = data.cases.find((c: Case) => c.id === Number(caseId))
          if (caseData) {
            setSelectedCase(caseData)
            fetchOffender(caseData.offender_id)
            setActiveTab("generate")
          }
        }
      } catch (error) {
        console.error("Error fetching cases:", error)
        toast.error("Failed to load cases")
      }
    }

    fetchTemplates()
    fetchCases()
  }, [caseId, templateId])

  // Fetch offender data when a case is selected
  const fetchOffender = async (offenderId: number) => {
    try {
      const res = await fetch(`/api/admin/offenders/${offenderId}`, { credentials: "include" })
      if (!res.ok) {
        throw new Error("Failed to fetch offender data")
      }
      const data = await res.json()
      setOffender(data.offender)
    } catch (error) {
      console.error("Error fetching offender:", error)
      toast.error("Failed to load offender data")
    }
  }

  const handleSelectTemplate = (template: MotionTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(false)

    // If we have a case selected, go to generate tab
    if (selectedCase) {
      setActiveTab("generate")
      prepareMotionVariables(template, selectedCase)
    }
  }

  const handleSelectCase = (caseData: Case) => {
    setSelectedCase(caseData)
    fetchOffender(caseData.offender_id)

    // If we have a template selected, prepare variables
    if (selectedTemplate) {
      prepareMotionVariables(selectedTemplate, caseData)
    }
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
        const res = await fetch(`/api/admin/motions/templates/${editedTemplate.id}`, {
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
        const res = await fetch(`/api/admin/motions/templates`, {
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
      const res = await fetch(`/api/admin/motions/templates/${selectedTemplate.id}`, {
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

  // Extract variables from template content
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{([^}]+)}}/g) || []
    return matches.map((match) => match.slice(2, -2).trim())
  }

  // Prepare motion variables when template and case are selected
  const prepareMotionVariables = (template: MotionTemplate, caseData: Case) => {
    if (!template || !caseData || !offender) return

    const variables = extractVariables(template.content)
    const initialValues: Record<string, string> = {}

    // Auto-populate variables from case and offender data
    variables.forEach((variable) => {
      switch (variable) {
        case "case_number":
          initialValues[variable] = caseData.case_number
          break
        case "court":
          initialValues[variable] = caseData.court
          break
        case "judge":
          initialValues[variable] = caseData.judge
          break
        case "offender_name":
          initialValues[variable] = offender ? `${offender.first_name} ${offender.last_name}` : ""
          break
        case "offender_first_name":
          initialValues[variable] = offender?.first_name || ""
          break
        case "offender_last_name":
          initialValues[variable] = offender?.last_name || ""
          break
        case "facility":
          initialValues[variable] = offender?.facility || ""
          break
        case "filing_date":
          initialValues[variable] = new Date().toLocaleDateString()
          break
        default:
          initialValues[variable] = ""
      }
    })

    setMotionVariables(initialValues)
  }

  // Generate motion with filled variables
  const generateMotion = () => {
    if (!selectedTemplate || !selectedCase) {
      toast.error("Please select a template and case")
      return
    }

    setIsGenerating(true)

    try {
      let content = selectedTemplate.content

      // Replace variables with their values
      Object.entries(motionVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g")
        content = content.replace(regex, value)
      })

      // Highlight any remaining variables
      content = content.replace(/{{([^}]+)}}/g, '<span style="background-color: yellow; color: black;">{{$1}}</span>')

      setGeneratedMotion(content)
      toast.success("Motion generated successfully")
    } catch (error) {
      console.error("Error generating motion:", error)
      toast.error("Failed to generate motion")
    } finally {
      setIsGenerating(false)
    }
  }

  // Submit the generated motion
  const submitMotion = async () => {
    if (!selectedTemplate || !selectedCase || !generatedMotion) {
      toast.error("Please generate a motion first")
      return
    }

    // Check if all variables are filled
    const remainingVariables = generatedMotion.match(/{{([^}]+)}}/g)
    if (remainingVariables) {
      toast.error("Please fill all variables before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/admin/motions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          case_id: selectedCase.id,
          template_id: selectedTemplate.id,
          title: selectedTemplate.title,
          content: generatedMotion,
          variables: motionVariables,
          status: "draft",
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit motion")
      }

      toast.success("Motion submitted successfully")

      // Reset the form
      setGeneratedMotion("")
      setMotionVariables({})
      setSelectedCase(null)
      setSelectedTemplate(null)
      setActiveTab("templates")
    } catch (error) {
      console.error("Error submitting motion:", error)
      toast.error("Failed to submit motion")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle variable input change
  const handleVariableChange = (variable: string, value: string) => {
    setMotionVariables((prev) => ({
      ...prev,
      [variable]: value,
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Motions Editor</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate Motion</TabsTrigger>
          <TabsTrigger value="preview">Preview & Submit</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
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
                          Use {"{variable_name}"} for dynamic content (e.g., {"{{case_number}}"})
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
                          Category:{" "}
                          {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)}
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
                  <CardFooter>
                    <Button className="ml-auto" onClick={() => setActiveTab("generate")} disabled={!selectedTemplate}>
                      Generate Motion
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a template from the list or create a new one
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Template
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Generate Motion Tab */}
        <TabsContent value="generate">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Case</CardTitle>
                <CardDescription>Choose a case to generate a motion for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={selectedCase?.id.toString()}
                    onValueChange={(value) => {
                      const caseData = cases.find((c) => c.id === Number(value))
                      if (caseData) handleSelectCase(caseData)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id.toString()}>
                          {caseItem.case_number} - {caseItem.offender_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedCase && (
                    <div className="border rounded-md p-4 mt-4">
                      <h3 className="font-medium mb-2">Case Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium">Case Number:</p>
                          <p>{selectedCase.case_number}</p>
                        </div>
                        <div>
                          <p className="font-medium">Court:</p>
                          <p>{selectedCase.court}</p>
                        </div>
                        <div>
                          <p className="font-medium">Judge:</p>
                          <p>{selectedCase.judge || "Not assigned"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status:</p>
                          <p>{selectedCase.status}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {offender && (
                    <div className="border rounded-md p-4 mt-4">
                      <h3 className="font-medium mb-2">Offender Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium">Name:</p>
                          <p>
                            {offender.first_name} {offender.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Inmate Number:</p>
                          <p>{offender.inmate_number}</p>
                        </div>
                        <div>
                          <p className="font-medium">Facility:</p>
                          <p>{offender.facility || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>Fill in the variables for the motion</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedTemplate ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Please select a template first</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("templates")}>
                      Select Template
                    </Button>
                  </div>
                ) : !selectedCase ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Please select a case first</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Template: {selectedTemplate.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill in the variables below to generate the motion
                      </p>
                    </div>

                    {Object.keys(motionVariables).length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No variables found in this template</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(motionVariables).map(([variable, value]) => (
                          <div key={variable} className="space-y-2">
                            <Label htmlFor={variable}>
                              {variable.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Label>
                            <Input
                              id={variable}
                              value={value}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("templates")}>
                  Back to Templates
                </Button>
                <Button onClick={generateMotion} disabled={!selectedTemplate || !selectedCase || isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Motion"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Preview & Submit Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Motion Preview</CardTitle>
              <CardDescription>Review and submit the generated motion</CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedMotion ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Motion Generated</h3>
                  <p className="text-sm text-muted-foreground mb-4">Generate a motion first to preview and submit it</p>
                  <Button onClick={() => setActiveTab("generate")}>Go to Generate Motion</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{selectedTemplate?.title}</h2>
                    <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                  </div>

                  <div className="border-t border-b py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Case Number:</p>
                        <p>{selectedCase?.case_number}</p>
                      </div>
                      <div>
                        <p className="font-medium">Court:</p>
                        <p>{selectedCase?.court}</p>
                      </div>
                      <div>
                        <p className="font-medium">Offender:</p>
                        <p>
                          {offender?.first_name} {offender?.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Filing Date:</p>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div
                      className="whitespace-pre-wrap border rounded-md p-6 bg-white text-black"
                      dangerouslySetInnerHTML={{ __html: generatedMotion }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("generate")}>
                Back to Edit
              </Button>
              <Button
                onClick={submitMotion}
                disabled={!generatedMotion || isSubmitting}
                className="bg-foreground text-background"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Motion
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

