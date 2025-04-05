"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface OffenderFormData {
  inmateNumber: string // required
  nmcdNumber: string
  firstName: string // required
  lastName: string // required
  middleName: string
  status: string // required
  facility: string
  age: string
  height: string
  weight: string
  eyeColor: string
  hair: string
  religion: string
  education: string
  complexion: string
  ethnicity: string
  alias: string
  mugshotUrl: string
  accountEnabled: boolean
  profileEnabled: boolean
  custodyStatus: string // required
}

export default function OffenderProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [formData, setFormData] = useState<OffenderFormData>({
    inmateNumber: "",
    nmcdNumber: "",
    firstName: "",
    lastName: "",
    middleName: "",
    status: "",
    facility: "",
    age: "",
    height: "",
    weight: "",
    eyeColor: "",
    hair: "",
    religion: "",
    education: "",
    complexion: "",
    ethnicity: "",
    alias: "",
    mugshotUrl: "",
    accountEnabled: true,
    profileEnabled: true,
    custodyStatus: "in_custody",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // If editing, load offender data from the API
  useEffect(() => {
    if (editId) {
      setIsLoading(true)
      fetch(`/api/admin/offenders/${editId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch offender data")
          return res.json()
        })
        .then((data) => {
          setFormData({
            inmateNumber: data.offender.inmateNumber,
            nmcdNumber: data.offender.nmcdNumber || "",
            firstName: data.offender.firstName,
            lastName: data.offender.lastName,
            middleName: data.offender.middleName || "",
            status: data.offender.status,
            facility: data.offender.facility || "",
            age: data.offender.age?.toString() || "",
            height: data.offender.height || "",
            weight: data.offender.weight?.toString() || "",
            eyeColor: data.offender.eyeColor || "",
            hair: data.offender.hair || "",
            religion: data.offender.religion || "",
            education: data.offender.education || "",
            complexion: data.offender.complexion || "",
            ethnicity: data.offender.ethnicity || "",
            alias: data.offender.alias || "",
            mugshotUrl: data.offender.mugshotUrl || "",
            accountEnabled: data.offender.accountEnabled ?? true,
            profileEnabled: data.offender.profileEnabled ?? true,
            custodyStatus: data.offender.custodyStatus || "in_custody",
          })
        })
        .catch((error) => {
          console.error("Error loading offender data:", error)
          toast.error("Failed to load offender data")
        })
        .finally(() => setIsLoading(false))
    }
  }, [editId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = {
      inmateNumber: formData.inmateNumber?.trim(),
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      status: formData.status?.trim(),
      custodyStatus: formData.custodyStatus?.trim()
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'))

    if (missingFields.length > 0) {
      toast.error(`Please fill out required fields: ${missingFields.join(", ")}`)
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = editId
        ? `/api/admin/offenders/${editId}`
        : `/api/admin/offenders`
      const method = editId ? "PUT" : "POST"

      // Convert string values to appropriate types and ensure all required fields are included
      const submissionData = {
        ...formData,
        inmateNumber: formData.inmateNumber.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        status: formData.status.trim(),
        custodyStatus: formData.custodyStatus.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        accountEnabled: Boolean(formData.accountEnabled),
        profileEnabled: Boolean(formData.profileEnabled),
        middleName: formData.middleName?.trim() || null,
        facility: formData.facility?.trim() || null,
        height: formData.height?.trim() || null,
        eyeColor: formData.eyeColor?.trim() || null,
        hair: formData.hair?.trim() || null,
        religion: formData.religion?.trim() || null,
        education: formData.education?.trim() || null,
        complexion: formData.complexion?.trim() || null,
        ethnicity: formData.ethnicity?.trim() || null,
        alias: formData.alias?.trim() || null,
        mugshotUrl: formData.mugshotUrl?.trim() || null,
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offender: submissionData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save offender profile")
      }

      toast.success(
        editId
          ? "Offender profile updated successfully"
          : "Offender profile created successfully"
      )
      router.push("/admin/dashboard/offenders")
    } catch (error: unknown) {
      console.error("Submission error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save offender profile"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-background">
        Loading...
      </div>
    )
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-background text-3xl">
        {editId ? "Edit Offender Profile" : "Create Offender Profile"}
      </h1>

      <div className="relative flex-1 overflow-y-auto">
        <Tabs className="w-full" defaultValue={editId ? "edit" : "create"}>
          <TabsList className="mb-4">
            <TabsTrigger className="font-kings text-background" value="create">
              Create New
            </TabsTrigger>
            <TabsTrigger className="font-kings text-background" value="edit">
              Edit Existing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="card-content">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="font-kings text-foreground">
                    New Offender Profile
                  </CardTitle>
                  <CardDescription className="text-foreground">
                    Create a new offender profile in the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-foreground">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Basic Information
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="inmateNumber">
                            Inmate Number{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            required
                            id="inmateNumber"
                            name="inmateNumber"
                            placeholder="e.g., 12345"
                            value={formData.inmateNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">
                            Status <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: string) =>
                              handleSelectChange("status", value)
                            }
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="released">Released</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">
                            Last Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            required
                            id="lastName"
                            name="lastName"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            required
                            id="firstName"
                            name="firstName"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middleName">Middle Name</Label>
                          <Input
                            id="middleName"
                            name="middleName"
                            placeholder="Middle name"
                            value={formData.middleName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facility">Facility</Label>
                          <Input
                            id="facility"
                            name="facility"
                            placeholder="e.g., Central Correctional Facility"
                            value={formData.facility}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Physical Characteristics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Physical Characteristics
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            name="age"
                            placeholder="Age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            name="height"
                            placeholder="e.g., 6'0"
                            value={formData.height}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (lbs)</Label>
                          <Input
                            id="weight"
                            name="weight"
                            placeholder="Weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eyeColor">Eye Color</Label>
                          <Select
                            value={formData.eyeColor}
                            onValueChange={(value: string) =>
                              handleSelectChange("eyeColor", value)
                            }
                          >
                            <SelectTrigger id="eyeColor">
                              <SelectValue placeholder="Select eye color" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="brown">Brown</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="hazel">Hazel</SelectItem>
                              <SelectItem value="gray">Gray</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hair">Hair Color</Label>
                          <Select
                            value={formData.hair}
                            onValueChange={(value: string) =>
                              handleSelectChange("hair", value)
                            }
                          >
                            <SelectTrigger id="hair">
                              <SelectValue placeholder="Select hair color" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="black">Black</SelectItem>
                              <SelectItem value="brown">Brown</SelectItem>
                              <SelectItem value="blonde">Blonde</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="gray">Gray/White</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ethnicity">Ethnicity</Label>
                          <Select
                            value={formData.ethnicity}
                            onValueChange={(value: string) =>
                              handleSelectChange("ethnicity", value)
                            }
                          >
                            <SelectTrigger id="ethnicity">
                              <SelectValue placeholder="Select ethnicity" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="caucasian">Caucasian</SelectItem>
                              <SelectItem value="african_american">
                                African American
                              </SelectItem>
                              <SelectItem value="hispanic">Hispanic</SelectItem>
                              <SelectItem value="asian">Asian</SelectItem>
                              <SelectItem value="native_american">
                                Native American
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* NMCD & Alias */}
                    <div className="space-y-2">
                      <Label htmlFor="nmcdNumber">NMCD Number</Label>
                      <Input
                        id="nmcdNumber"
                        name="nmcdNumber"
                        placeholder="NMCD Number"
                        value={formData.nmcdNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alias">Alias</Label>
                      <Input
                        id="alias"
                        name="alias"
                        placeholder="Known aliases"
                        value={formData.alias}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Additional Details
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion</Label>
                          <Input
                            id="religion"
                            name="religion"
                            placeholder="Religion"
                            value={formData.religion}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="education">Education</Label>
                          <Input
                            id="education"
                            name="education"
                            placeholder="Education level"
                            value={formData.education}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complexion">Complexion</Label>
                          <Select
                            value={formData.complexion}
                            onValueChange={(value: string) =>
                              handleSelectChange("complexion", value)
                            }
                          >
                            <SelectTrigger id="complexion">
                              <SelectValue placeholder="Select complexion" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Status & System Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Status & System Settings
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="custodyStatus">Custody Status</Label>
                          <Select
                            value={formData.custodyStatus}
                            onValueChange={(value: string) =>
                              handleSelectChange("custodyStatus", value)
                            }
                          >
                            <SelectTrigger id="custodyStatus">
                              <SelectValue placeholder="Select custody status" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="in_custody">In Custody</SelectItem>
                              <SelectItem value="released">Released</SelectItem>
                              <SelectItem value="transferred">
                                Transferred
                              </SelectItem>
                              <SelectItem value="escaped">Escaped</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mugshotUrl">Mugshot URL</Label>
                          <Input
                            id="mugshotUrl"
                            name="mugshotUrl"
                            placeholder="URL to mugshot image"
                            value={formData.mugshotUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              checked={formData.accountEnabled}
                              className="form-checkbox"
                              type="checkbox"
                              onChange={(e) =>
                                handleSelectChange(
                                  "accountEnabled",
                                  e.target.checked.toString()
                                )
                              }
                            />
                            <span>Account Enabled</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              checked={formData.profileEnabled}
                              className="form-checkbox"
                              type="checkbox"
                              onChange={(e) =>
                                handleSelectChange(
                                  "profileEnabled",
                                  e.target.checked.toString()
                                )
                              }
                            />
                            <span>Profile Enabled</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    className="button-link"
                    type="button"
                    variant="default"
                    onClick={() => router.push("/admin/dashboard/offenders")}
                  >
                    Cancel
                  </Button>
                  <Button className="button-link" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Saving..." : "Update Offender"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
