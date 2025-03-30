"use client";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Case {
  id: number;
  case_number: string;
  court: string;
  judge: string;
  filing_date: string;
  case_type: string;
  plaintiff: string;
  defendant: string;
  status: string;
  next_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function OffenderCasesPage() {
  const { id } = useParams<{ id: string }>();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch(`/api/offenders/${id}/cases`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch cases");
        }
        const data = await res.json();
        setCases(data.cases || []);
      } catch (err: unknown) {
        console.error("Error fetching cases:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchCases();
    }
  }, [id]);

  if (isLoading) return <div>Loading cases...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Cases</h1>
      {cases.length === 0 ? (
        <div>No cases found.</div>
      ) : (
        cases.map((c) => (
          <Card key={c.id} className="mb-4">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Case #{c.case_number}</CardTitle>
              <span className={`px-2 py-1 text-xs rounded ${c.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {c.status === "Active" ? "Open" : "Closed"}
              </span>
            </CardHeader>
            <CardContent>
              <p><strong>Court:</strong> {c.court}</p>
              <p><strong>Judge:</strong> {c.judge || "Not assigned"}</p>
              <p><strong>Filing Date:</strong> {new Date(c.filing_date).toLocaleDateString()}</p>
              <p><strong>Next Date:</strong> {c.next_date ? new Date(c.next_date).toLocaleString() : "None scheduled"}</p>
              <Button className="mt-2" variant="outline" onClick={() => window.location.href = `/offender/dashboard/${id}/cases/${c.id}`}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
