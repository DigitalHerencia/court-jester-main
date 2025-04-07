"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface CaseDetail {
  id: number;
  case_number: string;
  offender_id: number;
  offender_name: string;
  court: string;
  judge: string;
  next_date: string;
  created_at: string;
  charges: Array<{ charge: string; description: string }>;
}

export default function OffenderCaseDetailPage() {
  const params = useParams();
  const offenderId = params?.id;
  const caseId = params?.caseId;
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offenderId || !caseId) return;
    async function fetchCaseDetail() {
      try {
        const res = await fetch(`/api/offenders/${offenderId}/cases/${caseId}`);
        if (!res.ok) throw new Error("Failed to fetch case detail");
        const data = await res.json();
        setCaseDetail(data.data);
      } catch (error) {
        console.error("Error fetching case detail:", error);
        toast.error("Error fetching case detail");
      } finally {
        setLoading(false);
      }
    }
    fetchCaseDetail();
  }, [offenderId, caseId]);

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Case #{caseDetail?.case_number || caseId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading case details...</p>
        ) : caseDetail ? (
          <div className="space-y-4">
            <p>
              <strong>Court:</strong> {caseDetail.court}
            </p>
            <p>
              <strong>Judge:</strong> {caseDetail.judge}
            </p>
            <p>
              <strong>Next Date:</strong> {caseDetail.next_date}
            </p>
            <p>
              <strong>Created At:</strong> {caseDetail.created_at}
            </p>
            <div>
              <strong>Charges:</strong>
              {caseDetail.charges && caseDetail.charges.length > 0 ? (
                <ul className="list-disc ml-6">
                  {caseDetail.charges.map((charge, idx) => (
                    <li key={idx}>
                      {charge.charge}: {charge.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No charges available.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Case not found.</p>
        )}
      </CardContent>
      <div className="p-4">
        <Link
          className="text-primary underline"
          href={`/offender/dashboard/${offenderId}/cases`}
        >
          &larr; Back to Cases
        </Link>
      </div>
    </Card>
  );
}
