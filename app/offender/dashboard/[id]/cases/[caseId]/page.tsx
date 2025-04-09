// ✅ Path: app/offender/dashboard/[id]/cases/[caseId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, User } from "lucide-react";
import Link from "next/link";

interface Charge {
  id: number;
  description: string;
  statute: string;
  class: string;
  citation_number: string;
  disposition: string;
  charge_date: string;
}

interface Hearing {
  id: number;
  hearing_date: string;
  hearing_time: string;
  hearing_type: string;
  hearing_judge: string;
  court: string;
  court_room: string;
  status: string;
}

interface Motion {
  id: number;
  title: string;
  status: string;
  filing_date?: string;
  created_at: string;
}

interface CaseDetail {
  id: number;
  case_number: string;
  offender_id: number;
  offender_name: string;
  court: string;
  judge: string;
  next_date: string | null;
  created_at: string;
  charges: Charge[];
}

export default function OffenderCaseDetailPage() {
  // Explicitly type parameters for clarity.
  const { id: offenderId, caseId } = useParams() as { id: string; caseId: string };

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loadingCase, setLoadingCase] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<"charges" | "hearings" | "motions">("charges");

  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loadingHearings, setLoadingHearings] = useState<boolean>(false);

  const [motions, setMotions] = useState<Motion[]>([]);
  const [loadingMotions, setLoadingMotions] = useState<boolean>(false);

  useEffect(() => {
    if (!offenderId || !caseId) return;

    async function fetchCaseData() {
      try {
        const res = await fetch(`/api/offenders/${offenderId}/cases/${caseId}`);
        if (!res.ok) throw new Error("Failed to fetch case detail");
        const data = await res.json();
        setCaseDetail(data.data);
      } catch (error) {
        console.error("Error fetching case detail:", error);
      } finally {
        setLoadingCase(false);
      }
    }

    fetchCaseData();
  }, [offenderId, caseId]);

  // Fetch hearings data when "hearings" tab is active

  useEffect(() => {
    if (activeTab !== "hearings" || !offenderId || !caseId) return;
  
    async function fetchHearings() {
      setLoadingHearings(true);
      try {
        // Update URL to use a query parameter "caseId"
        const res = await fetch(`/api/offenders/${offenderId}/hearings?caseId=${caseId}`);
        if (!res.ok) throw new Error("Failed to fetch hearings");
        const data = await res.json();
        setHearings(data.hearings);
      } catch (error) {
        console.error("Error fetching hearings:", error);
      } finally {
        setLoadingHearings(false);
      }
    }
  
    fetchHearings();
  }, [activeTab, offenderId, caseId]);

  // Fetch motions data when "motions" tab is active
  useEffect(() => {
    if (activeTab !== "motions" || !offenderId || !caseId) return;

    async function fetchMotions() {
      setLoadingMotions(true);
      try {
        // Using a query parameter to pass caseId into the motions list endpoint
        const res = await fetch(`/api/offenders/${offenderId}/motions?caseId=${caseId}`);
        if (!res.ok) throw new Error("Failed to fetch motions");
        const data = await res.json();
        setMotions(data.motions);
      } catch (error) {
        console.error("Error fetching motions:", error);
      } finally {
        setLoadingMotions(false);
      }
    }

    fetchMotions();
  }, [activeTab, offenderId, caseId]);

  const formatDate = (date: string | null): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loadingCase) {
    return <div className="text-center mt-10">Loading case details...</div>;
  }

  if (!caseDetail) {
    return <div className="text-center mt-10">Case not found.</div>;
  }

  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-background text-3xl mb-2">
        Case #{caseDetail.case_number}
      </h1>

      <div className="card-content">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              {caseDetail.offender_name}
            </div>
            <div className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" />
              {formatDate(caseDetail.next_date)}
            </div>
            <div className="flex items-center gap-2 text-xl">
            <Badge variant={caseDetail.next_date ? "success" : "error"}>
              {caseDetail.next_date ? "Active" : "Closed"}
            </Badge>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold">Court:</h3>
              <p>{caseDetail.court || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Judge:</h3>
              <p>{caseDetail.judge || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Created:</h3>
              <p>{formatDate(caseDetail.created_at)}</p>
            </div>
          </div>
        </div>

        <Tabs
          className="w-full mt-6"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "charges" | "hearings" | "motions")}
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger className="font-kings bg-foreground text-background" value="charges">
              Charges ({caseDetail.charges.length})
            </TabsTrigger>
            <TabsTrigger className="font-kings bg-foreground text-background" value="hearings">
              Hearings ({hearings.length})
            </TabsTrigger>
            <TabsTrigger className="font-kings bg-foreground text-background" value="motions">
              Motions ({motions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <CardTitle className="font-kings text-2xl">Charges</CardTitle>
              </CardHeader>
              <CardContent>
                {caseDetail.charges.length === 0 ? (
                  <div className="border-dashed border rounded p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 mb-4" />
                    <p>No charges recorded for this case.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border">
                      <thead>
                        <tr className="bg-background text-left">
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Statute</th>
                          <th className="px-4 py-2">Class</th>
                          <th className="px-4 py-2">Citation</th>
                          <th className="px-4 py-2">Disposition</th>
                          <th className="px-4 py-2">Filed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseDetail.charges.map((charge) => (
                          <tr key={charge.id} className="border-t">
                            <td className="px-4 py-2">{charge.description}</td>
                            <td className="px-4 py-2">{charge.statute}</td>
                            <td className="px-4 py-2">{charge.class}</td>
                            <td className="px-4 py-2">{charge.citation_number}</td>
                            <td className="px-4 py-2">{charge.disposition || "Pending"}</td>
                            <td className="px-4 py-2">{formatDate(charge.charge_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hearings">
            {loadingHearings ? (
              <div className="p-4 text-center">Loading hearings...</div>
            ) : hearings.length === 0 ? (
              <div className="p-4 text-center">No hearings scheduled for this case.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-background text-left">
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Judge</th>
                      <th className="px-4 py-2">Court</th>
                      <th className="px-4 py-2">Room</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hearings.map((hearing) => (
                      <tr key={hearing.id} className="border-t">
                        <td className="px-4 py-2">{formatDate(hearing.hearing_date)}</td>
                        <td className="px-4 py-2">{hearing.hearing_time}</td>
                        <td className="px-4 py-2">{hearing.hearing_type}</td>
                        <td className="px-4 py-2">{hearing.hearing_judge || "TBA"}</td>
                        <td className="px-4 py-2">{hearing.court}</td>
                        <td className="px-4 py-2">{hearing.court_room || "N/A"}</td>
                        <td className="px-4 py-2">{hearing.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="motions">
            {loadingMotions ? (
              <div className="p-4 text-center">Loading motions...</div>
            ) : motions.length === 0 ? (
              <div className="p-4 text-center">No motions available for this case.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-background text-left">
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Filed</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motions.map((motion) => (
                      <tr key={motion.id} className="border-t">
                        <td className="px-4 py-2">{motion.title}</td>
                        <td className="px-4 py-2">{motion.status}</td>
                        <td className="px-4 py-2">
                          {motion.filing_date ? formatDate(motion.filing_date) : "N/A"}
                        </td>
                        <td className="px-4 py-2">{formatDate(motion.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4">
        <Link className="text-primary underline" href={`/offender/dashboard/${offenderId}/cases`}>
          &larr; Back to Cases
        </Link>
      </div>
    </div>
  );
}
