// app/offender/dashboard/[id]/cases/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface Case {
  id: number;
  case_number: string;
  court: string;
  judge: string;
  next_date: string;
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
        <CardTitle className="text-2xl font-bold">My Cases</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading cases...</p>
        ) : cases.length === 0 ? (
          <p>No cases found.</p>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <div key={c.id} className="card-content  rounded p-4 hover:shadow">
                <h2 className="text-lg font-semibold">Case #{c.case_number}</h2>
                <p className="text-sm text-muted-foreground">
                  Court: {c.court} | Judge: {c.judge}
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
