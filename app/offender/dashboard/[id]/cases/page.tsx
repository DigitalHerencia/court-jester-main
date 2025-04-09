// ✅ Path: app/offender/dashboard/[id]/cases/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface Case {
  id: number;
  case_number: string;
  court: string;
  judge: string;
  next_date: string | null;
  created_at: string;
  // additional fields if needed
}

export default function OffenderCasesPage() {
  const params = useParams();
  const offenderId = params?.id;
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offenderId) return;
    async function fetchCases() {
      try {
        const res = await fetch(`/api/offenders/${offenderId}/cases`);
        if (!res.ok) throw new Error("Failed to fetch cases");
        const data = await res.json();
        setCases(data.cases);
      } catch (error) {
        console.error("Error fetching cases:", error);
        toast.error("Error fetching cases");
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [offenderId]);

  return (
    <Card className="card-secondary shadow mb-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Cases</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading cases...</p>
        ) : cases.length === 0 ? (
          <p>No cases found.</p>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <div key={c.id} className="card-content rounded p-4 hover:shadow">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    <span className="font-semibold">Case Number:</span> {c.case_number}
                  </h2>
                  <Badge variant={c.next_date ? "success" : "error"}>
                    {c.next_date ? "Active" : "Closed"}
                  </Badge>
                </div>
                <p className="text-md text-foreground mt-1">
                  <span className="font-medium">Court:</span> {c.court} |{" "}
                  <span className="font-medium">Judge:</span> {c.judge}
                </p>
                <Link
                  className="text-primary underline mt-2 block"
                  href={`/offender/dashboard/${offenderId}/cases/${c.id}`}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
