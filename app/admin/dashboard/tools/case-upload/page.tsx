"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUp, AlertCircle, CheckCircle2, File } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ParsedCaseData } from "@/lib/case-parser"

interface CaseItem {
  offender_name: string
  status: string
  next_hearing: Date | null 
  id: number
  case_number: string
}

interface UploadResult {
  success: boolean
  message: string
  details?: string
  cases?: CaseItem[]
}

interface RecentUpload {
  id: string
  filename: string
  timestamp: string
  status: "success" | "error"
  caseNumber?: string
}

interface UploadWarnings {
  message: string;
  details?: string[];
  level: "info" | "warning";
}

export default function CaseUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOffenderId, setSelectedOffenderId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [offenders, setOffenders] = useState<Array<{ id: number; name: string }>>([]);
  const [parsedCase, setParsedCase] = useState<ParsedCaseData | null>(null);
  const [warnings, setWarnings] = useState<UploadWarnings[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface Offender {
    id: number;
    first_name: string;
    last_name: string;
  }

  useEffect(() => {
    fetch("/api/admin/offenders")
      .then((res) => res.json())
      .then((data) => {
        setOffenders(
          data.offenders.map((o: Offender) => ({
            id: o.id,
            name: `${o.last_name}, ${o.first_name}`,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching offenders:", error);
        toast.error("Failed to load offenders list");
      });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setParsedCase(null);
      setUploadResult(null);
      return;
    }

    if (file.type !== "text/csv") {
      toast.error("Only CSV files are supported");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
    setParsedCase(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedOffenderId) {
      toast.error("Please select both a file and an offender");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setParsedCase(null);
    setWarnings([]);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("caseFile", selectedFile);
      formData.append("offenderId", selectedOffenderId);

      const response = await fetch(`/api/admin/cases/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        setParsedCase(result.caseData);
        setUploadResult({
          success: true,
          message: "Case file uploaded and processed successfully",
          details: `Case #${result.caseData.caseDetail.case_number} has been created with ${result.caseData.charges?.length || 0} charges and ${result.caseData.hearings?.length || 0} hearings.`,
        });

        if (result.warnings?.length > 0) {
          setWarnings([
            {
              message: "The following issues were found but did not prevent processing:",
              details: result.warnings,
              level: "warning"
            }
          ])
        }

        setRecentUploads((prev) => [
          {
            id: Date.now().toString(),
            filename: selectedFile.name,
            timestamp: new Date().toISOString(),
            status: "success",
            caseNumber: result.caseData.caseDetail.case_number,
          },
          ...prev.slice(0, 4),
        ]);

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        try {
          await fetch("/api/admin/dashboard/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: selectedOffenderId,
              type: "case_created",
              message: `A new case (${result.caseData.caseDetail.case_number}) has been added to your account.`,
              data: {
                caseNumber: result.caseData.caseDetail.case_number,
              },
            }),
          });
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
        }

        toast.success("Case file processed successfully");
      } else {
        throw new Error(result.error || "Failed to process case file");
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadResult({
        success: false,
        message: "Failed to process case file",
        details: (error as Error).message || "There was an error processing your file.",
      });

      if (error instanceof Error && error.message.includes("Invalid case file content")) {
        setWarnings([
          {
            message: "The following validation errors were found:",
            details: error.message.split(". "),
            level: "warning"
          }
        ])
      }

      setRecentUploads((prev) => [
        {
          id: Date.now().toString(),
          filename: selectedFile.name,
          timestamp: new Date().toISOString(),
          status: "error",
        },
        ...prev.slice(0, 4),
      ]);

      toast.error("Failed to process case file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-3xl text-background mb-6">Case Upload Tool</h1>

      <Tabs className="w-full" defaultValue="upload">
        <TabsList className="mb-4">
          <TabsTrigger className="font-kings text-background" value="upload">
            Upload
          </TabsTrigger>
          <TabsTrigger className="font-kings text-background" value="history">
            Upload History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-content">
              <CardHeader>
                <CardTitle className="font-kings text-foreground">
                  Upload Case File
                </CardTitle>
                <CardDescription className="text-foreground">
                  Upload a CSV case file to extract and create case records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-background" htmlFor="offender">
                      Select Offender
                    </Label>
                    <Select
                      value={selectedOffenderId}
                      onValueChange={setSelectedOffenderId}
                    >
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select an offender..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-foreground">
                        {offenders.map((offender) => (
                          <SelectItem key={offender.id} value={String(offender.id)}>
                            {offender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-background" htmlFor="caseFile">
                      Case File (CSV)
                    </Label>
                    <Input
                      ref={fileInputRef}
                      accept=".csv"
                      className="bg-background text-foreground"
                      disabled={isUploading}
                      id="caseFile"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Accepted format: CSV. Maximum size: 10MB.
                    </p>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-background">
                        <span>Processing...</span>
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
                        <AlertDescription className="mt-2">
                          {uploadResult.details}
                        </AlertDescription>
                      )}
                    </Alert>
                  )}

                  {warnings.length > 0 && (
                    <div className="space-y-2">
                      {warnings.map((warning, index) => (
                        <Alert
                          key={index}
                          variant={warning.level === "warning" ? "destructive" : "default"}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{warning.message}</AlertTitle>
                          {warning.details && (
                            <AlertDescription>
                              <ul className="list-disc pl-4 mt-2">
                                {warning.details.map((detail, i) => (
                                  <li key={i}>{detail}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          )}
                        </Alert>
                      ))}
                    </div>
                  )}

                  {parsedCase && (
                    <div className="mt-4 space-y-4 border rounded-md p-4">
                      <h3 className="font-medium text-background">Parsed Case Details:</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Case Number:</strong> {parsedCase.caseDetail.case_number}</p>
                        <p><strong>Court:</strong> {parsedCase.caseDetail.court}</p>
                        <p><strong>Judge:</strong> {parsedCase.caseDetail.judge || 'Not assigned'}</p>
                        <p><strong>Filing Date:</strong> {parsedCase.caseDetail.filing_date instanceof Date ? parsedCase.caseDetail.filing_date.toLocaleDateString() : 'Invalid date'}</p>
                        <p><strong>Case Type:</strong> {parsedCase.caseDetail.case_type}</p>
                        {parsedCase.caseDetail.plaintiff && (
                          <p><strong>Plaintiff:</strong> {parsedCase.caseDetail.plaintiff}</p>
                        )}
                        {parsedCase.caseDetail.defendant && (
                          <p><strong>Defendant:</strong> {parsedCase.caseDetail.defendant}</p>
                        )}
                        <div className="mt-2">
                          <p><strong>Charges ({parsedCase.charges.length}):</strong></p>
                          <ul className="list-disc pl-4 mt-1">
                            {parsedCase.charges.map((charge, i) => (
                              <li key={i}>
                                Count {charge.count_number}: {charge.description} ({charge.statute})
                                {charge.class && ` - Class ${charge.class}`}
                                {charge.disposition && ` - ${charge.disposition}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {parsedCase.hearings.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Hearings ({parsedCase.hearings.length}):</strong></p>
                            <ul className="list-disc pl-4 mt-1">
                              {parsedCase.hearings.map((hearing, i) => (
                                <li key={i}>
                                  {new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}
                                  {hearing.hearing_type && ` - ${hearing.hearing_type}`}
                                  {hearing.court_room && ` (${hearing.court} - Room ${hearing.court_room})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsedCase.motionFilings.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Motions ({parsedCase.motionFilings.length}):</strong></p>
                            <ul className="list-disc pl-4 mt-1">
                              {parsedCase.motionFilings.map((motion, i) => (
                                <li key={i}>
                                  {new Date(motion.filing_date).toLocaleDateString()} - {motion.title}
                                  {motion.status && ` (${motion.status})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full button-link"
                  disabled={!selectedFile || !selectedOffenderId || isUploading}
                  onClick={handleUpload}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {isUploading ? "Processing..." : "Upload Case File"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-content">
              <CardHeader>
                <CardTitle className="font-kings text-foreground">
                  Recent Uploads
                </CardTitle>
                <CardDescription className="text-foreground">
                  Your 5 most recent case file uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentUploads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent uploads</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-md border card-content"
                      >
                        <div className="flex items-start gap-3">
                          <File className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-background">
                              {upload.filename}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(upload.timestamp).toLocaleString()}
                            </p>
                            {upload.caseNumber && (
                              <p className="text-sm text-muted-foreground">
                                Case Number: {upload.caseNumber}
                              </p>
                            )}
                          </div>
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
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="font-kings text-background">
                Upload History
              </CardTitle>
              <CardDescription className="text-background">
                Complete history of case file uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Upload history will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
