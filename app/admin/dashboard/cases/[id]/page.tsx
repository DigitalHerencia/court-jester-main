"use client";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";

interface CaseData {
  case: {
    id: number;
    case_number: string;
    offender_id: number;
    offender_name: string;
    court: string;
    judge: string;
    status: string;
    next_date: string | null;
    created_at: string;
    updated_at: string;
  };
  charges: Array<{
    id: number;
    description: string;
    statute: string;
    severity: string;
    disposition: string;
  }>;
  hearings: Array<{
    id: number;
    date: string;
    time: string;
    location: string;
    type: string;
    notes: string;
  }>;
  motions: Array<{
    id: number;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const response = await fetch(`/api/admin/cases/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch case data");
        }
        const data = await response.json();
        setCaseData(data);
      } catch (err) {
        console.error("Error fetching case data:", err);
        setError("Failed to load case data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCaseData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading case details...</div>
          <div className="text-foreground/60">Please wait while we fetch the case data.</div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error || "Failed to load case data."}</div>
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { case: caseInfo, charges, hearings, motions } = caseData;

  return (
    <div className="space-y-2">
      {/* Top block with "font-kings" and bg-primary */}
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h1 className="font-kings mb-2 text-xl">Case #{caseInfo.case_number}</h1>
        <p>View and manage all details related to this case.</p>
      </div>

      {/* Main content block */}
      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background space-y-6">
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <Link href={`/admin/dashboard/cases/${id}/edit`}>
              <Button variant="outline">Edit Case</Button>
            </Link>
            <Link href={`/admin/dashboard/offenders/${caseInfo.offender_id}`}>
              <Button className="bg-background text-foreground hover:bg-background/90">View Offender</Button>
            </Link>
          </div>
        </div>

        {/* Tabs for Charges, Hearings, Motions */}
        <Tabs defaultValue="charges">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charges">Charges</TabsTrigger>
            <TabsTrigger value="hearings">Hearings</TabsTrigger>
            <TabsTrigger value="motions">Motions</TabsTrigger>
          </TabsList>

          {/* Charges Tab */}
          <TabsContent className="mt-4" value="charges">
            <Card>
              <CardHeader>
                <CardTitle>Charges</CardTitle>
              </CardHeader>
              <CardContent>
                {charges.length === 0 ? (
                  <div className="rounded-md border border-foreground/20 p-4 text-center">
                    <p className="text-foreground/60">No charges for this case.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-foreground/20">
                    <table className="w-full border-collapse">
                      <thead className="bg-foreground/10">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Description</th>
                          <th className="px-4 py-2 text-left font-medium">Statute</th>
                          <th className="px-4 py-2 text-left font-medium">Severity</th>
                          <th className="px-4 py-2 text-left font-medium">Disposition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {charges.map((charge) => (
                          <tr key={charge.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                            <td className="px-4 py-2">{charge.description}</td>
                            <td className="px-4 py-2">{charge.statute}</td>
                            <td className="px-4 py-2">{charge.severity}</td>
                            <td className="px-4 py-2">{charge.disposition}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hearings Tab */}
          <TabsContent className="mt-4" value="hearings">
            <Card>
              <CardHeader>
                <CardTitle>Hearings</CardTitle>
              </CardHeader>
              <CardContent>
                {hearings.length === 0 ? (
                  <div className="rounded-md border border-foreground/20 p-4 text-center">
                    <p className="text-foreground/60">No upcoming court dates for this case.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-foreground/20">
                    <table className="w-full border-collapse">
                      <thead className="bg-foreground/10">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Date</th>
                          <th className="px-4 py-2 text-left font-medium">Time</th>
                          <th className="px-4 py-2 text-left font-medium">Type</th>
                          <th className="px-4 py-2 text-left font-medium">Location</th>
                          <th className="px-4 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hearings.map((hearing) => (
                          <tr key={hearing.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                            <td className="px-4 py-2">{new Date(hearing.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{hearing.time}</td>
                            <td className="px-4 py-2">{hearing.type}</td>
                            <td className="px-4 py-2">{hearing.location}</td>
                            <td className="px-4 py-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
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

          {/* Motions Tab */}
          <TabsContent className="mt-4" value="motions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Motions</CardTitle>
                <Link href={`/admin/dashboard/tools/motions-editor?caseId=${id}`}>
                  <Button size="sm" variant="outline">Create Motion</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {motions.length === 0 ? (
                  <div className="rounded-md border border-foreground/20 p-4 text-center">
                    <p className="text-foreground/60">No motions have been filed for this case.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-foreground/20">
                    <table className="w-full border-collapse">
                      <thead className="bg-foreground/10">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Title</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                          <th className="px-4 py-2 text-left font-medium">Created</th>
                          <th className="px-4 py-2 text-left font-medium">Updated</th>
                          <th className="px-4 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {motions.map((motion) => (
                          <tr key={motion.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                            <td className="px-4 py-2">{motion.title}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-xs ${
                                  motion.status === "Draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : motion.status === "Submitted"
                                    ? "bg-blue-100 text-blue-800"
                                    : motion.status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {motion.status}
                              </span>
                            </td>
                            <td className="px-4 py-2">{new Date(motion.created_at).toLocaleString()}</td>
                            <td className="px-4 py-2">{new Date(motion.updated_at).toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <Link href={`/admin/dashboard/tools/motions-editor?id=${motion.id}`}>
                                  <Button size="sm" variant="outline">View</Button>
                                </Link>
                              </div>
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
        </Tabs>
      </div>
    </div>
  );
}
