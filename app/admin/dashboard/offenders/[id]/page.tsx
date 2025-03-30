"use client";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, FileText, AlertTriangle,  Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";

interface OffenderData {
  offender: {
    mugshot_url: string;
    id: number;
    inmate_number: string;
    nmcd_number: string | null;
    first_name: string;
    last_name: string;
    middle_name?: string;
    status: string;
    custody_status: string;
    account_enabled: boolean;
    profile_enabled: boolean;
    facility?: string;
    age?: number;
    date_of_birth?: string;
    gender: string;
    race: string;
    ethnicity: string;
  };
  cases: Array<{
    id: number;
    case_number: string;
    court: string;
    judge: string;
    status: string;
    next_date: string | null;
    created_at: string;
    updated_at: string;
  }>;
  notifications: Array<{
    id: number;
    type: string;
    message: string;
    read: boolean;
    created_at: string;
  }>;
}

export default function OffenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offenderData, setOffenderData] = useState<OffenderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffenderData() {
      try {
        const response = await fetch(`/api/admin/offenders/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch offender data");
        }
        const data = await response.json();
        setOffenderData(data);
      } catch (error) {
        console.error("Error fetching offender data:", error);
        setError("Failed to load offender data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchOffenderData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading offender details...</div>
          <div className="text-foreground/60">Please wait while we fetch the offender data.</div>
        </div>
      </div>
    );
  }

  if (error || !offenderData) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load offender data."}</div>
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { offender, cases, notifications } = offenderData;

  // Helper to format dates safely
  const formatDate = (dateString?: string) => (dateString ? format(parseISO(dateString), "MMM d, yyyy") : "N/A");

  return (
    <div className="space-y-6">
      {/* Header: Title & Action Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offender Profile</h1>
        <div className="flex gap-2">
          <Link href={`/admin/dashboard/tools/offender-profile?id=${id}`}>
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link href={`/admin/dashboard/tools/mugshot-upload?id=${id}`}>
            <Button className="bg-foreground text-background">Update Mugshot</Button>
          </Link>
        </div>
      </div>

      {/* Basic Info & Mugshot */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-40 w-32 overflow-hidden rounded-md bg-foreground/10">
                {offender ? (
                  offender.profile_enabled && offender.account_enabled ? (
                    <Image
                      alt="Mugshot"
                      className="object-cover"
                      height={160}
                      src={offender.mugshot_url || "/placeholder.png"}
                      width={128}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-sm text-foreground/50">
                      Profile not visible
                    </div>
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-foreground/50">No mugshot available</div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {offender.last_name}, {offender.first_name} {offender.middle_name || ""}
                </h2>
                <p>
                  <strong>Inmate #:</strong> {offender.inmate_number}
                </p>
                <p>
                  <strong>Custody:</strong>{" "}
                  {offender.custody_status === "in_custody" ? "In Custody" : "Released"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Personal details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Status:</strong> {offender.status}
              </p>
              <p>
                <strong>Facility:</strong> {offender.facility || "N/A"}
              </p>
              <p>
                <strong>Age:</strong> {offender.age ?? "N/A"}
              </p>
              <p>
                <strong>Date of Birth:</strong> {offender.date_of_birth ? formatDate(offender.date_of_birth) : "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {offender.gender}
              </p>
              <p>
                <strong>Race:</strong> {offender.race}
              </p>
              <p>
                <strong>Ethnicity:</strong> {offender.ethnicity}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Cases & Notifications */}
      <Tabs defaultValue="cases">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Cases Tab */}
        <TabsContent className="mt-4" value="cases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cases</CardTitle>
              <Link href={`/admin/dashboard/tools/case-upload?offenderId=${id}`}>
                <Button size="sm" variant="outline">Add Case</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="rounded-md border border-foreground/20 p-4 text-center">
                  <p className="text-foreground/60">No cases have been added for this offender.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-foreground/20">
                  <table className="w-full border-collapse">
                    <thead className="bg-foreground/10">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Case #</th>
                        <th className="px-4 py-2 text-left font-medium">Court</th>
                        <th className="px-4 py-2 text-left font-medium">Judge</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                        <th className="px-4 py-2 text-left font-medium">Next Date</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((caseItem) => (
                        <tr key={caseItem.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                          <td className="px-4 py-2">{caseItem.case_number}</td>
                          <td className="px-4 py-2">{caseItem.court}</td>
                          <td className="px-4 py-2">{caseItem.judge || "Not assigned"}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs ${
                                caseItem.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {caseItem.next_date ? new Date(caseItem.next_date).toLocaleString() : "None scheduled"}
                          </td>
                          <td className="px-4 py-2">
                            <Link href={`/admin/dashboard/cases/${caseItem.id}`}>
                              <Button size="sm" variant="outline">View Details</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent className="mt-4" value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="rounded-md border border-foreground/20 p-4 text-center">
                  <p className="text-foreground/60">No notifications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="border border-foreground/20">
                      <CardHeader className="flex justify-between">
                        <div className="flex items-center gap-2">
                          {notification.type === "court_date" ? (
                            <Calendar className="h-5 w-5 text-blue-500" />
                          ) : notification.type === "motion_status" ? (
                            <FileText className="h-5 w-5 text-green-500" />
                          ) : notification.type === "system" ? (
                            <Info className="h-5 w-5 text-gray-500" />
                          ) : notification.type === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Bell className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="font-medium capitalize">{notification.type.replace("_", " ")}</span>
                        </div>
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => { /* Mark as read action might be implemented elsewhere */ }}>
                            Mark as Read
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p>{notification.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
