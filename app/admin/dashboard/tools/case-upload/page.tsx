"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUp, AlertCircle, CheckCircle2, File } from "lucide-react"
import { toast } from "sonner"

interface UploadResult {
  success: boolean
  message: string
  details?: string
  cases?: any[]
}

interface RecentUpload {
  id: string
  filename: string
  timestamp: string
  status: "success" | "error"
}

export default function CaseUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress tracking
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5
        return newProgress >= 90 ? 90 : newProgress
      })
    }, 300)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("caseFile", selectedFile)

      // Upload the file to the API
      const response = await fetch("/api/admin/cases", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: "Case file uploaded successfully",
          details: `The system extracted ${result.cases?.length || 0} cases and created corresponding records.`,
          cases: result.cases,
        })

        // Add to recent uploads (limit to 5 most recent)
        setRecentUploads((prev) => [
          {
            id: Date.now().toString(),
            filename: selectedFile.name,
            timestamp: new Date().toISOString(),
            status: "success",
          },
          ...prev.slice(0, 4),
        ])

        // Clear file selection
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        toast.success("Case file uploaded successfully")
      } else {
        throw new Error(result.error || "Failed to upload case file")
      }
    } catch (error: any) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setUploadResult({
        success: false,
        message: "Failed to upload case file",
        details: error.message || "There was an error processing your file. Please check the format and try again.",
      })

      // Add to recent uploads
      setRecentUploads((prev) => [
        {
          id: Date.now().toString(),
          filename: selectedFile.name,
          timestamp: new Date().toISOString(),
          status: "error",
        },
        ...prev.slice(0, 4),
      ])

      toast.error("Failed to upload case file")
    } finally {
      setIsUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Case Upload Tool</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Case File</CardTitle>
                <CardDescription>Upload a PDF case file to extract and create case records.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseFile">Case File (PDF)</Label>
                    <Input
                      id="caseFile"
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <p className="text-sm text-muted-foreground">Accepted format: PDF. Maximum size: 10MB.</p>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {uploadResult && (
                    <Alert variant={uploadResult.success ? "default" : "destructive"}>
                      <div className="flex items-center gap-2">
                        {uploadResult.success ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{uploadResult.message}</AlertTitle>
                      </div>
                      {uploadResult.details && (
                        <AlertDescription className="mt-2">{uploadResult.details}</AlertDescription>
                      )}
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
                  <FileUp className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Case File"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Your 5 most recent case file uploads</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUploads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent uploads</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUploads.map((upload) => (
                      <div key={upload.id} className="flex items-start gap-3 p-3 rounded-md border">
                        <File className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{upload.filename}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(upload.timestamp)}</p>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            upload.status === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {upload.status === "success" ? "Success" : "Failed"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>Complete history of case file uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Upload history will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

