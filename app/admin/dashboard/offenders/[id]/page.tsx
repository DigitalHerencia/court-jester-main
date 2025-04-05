"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface OffenderData {
  offender: {
    inmateNumber: string;
    nmcdNumber?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    status: string;
    facility?: string;
    age?: number;
    height?: string;
    weight?: number;
    eyeColor?: string;
    hair?: string;
    religion?: string;
    education?: string;
    complexion?: string;
    ethnicity?: string;
    alias?: string;
    mugshotUrl?: string;
    accountEnabled: boolean;
    profileEnabled: boolean;
    custodyStatus: string;
  };
  cases: Array<{
    id: number;
    caseNumber: string;
    court: string;
    status: string;
    nextDate?: string;
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
        if (!data.offender) {
          throw new Error("Offender data is missing from the response");
        }
        setOffenderData(data);
      } catch (err) {
        console.error("Error fetching offender data:", err);
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
          <div className="mb-4 text-2xl font-bold text-background">
            Loading offender details...
          </div>
          <div className="text-foreground/60">
            Please wait while we fetch the offender data.
          </div>
        </div>
      </div>
    );
  }

  if (error || !offenderData || !offenderData.offender) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">
            {error || "Failed to load offender data."}
          </div>
          <Button className="button-link" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { offender, cases } = offenderData;
  const fullName = `${offender.firstName} ${offender.middleName ? offender.middleName + " " : ""}${offender.lastName}`;

  return (
    <div className="card-secondary space-y-4 p-4">
      {/* Header Block */}
      <div className="card-primary p-4">
        <h1 className="font-kings text-3xl text-primary-foreground mb-2">
          Inmate: {fullName}
        </h1>
        <p className="text-primary-foreground">
          View and manage all details related to this inmate.
        </p>
      </div>

      {/* Offender Information */}
      <div className="card-content space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-4">
            {offender.mugshotUrl ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-foreground/20">
                <Image
                  fill
                  alt={`Mugshot of ${fullName}`}
                  className="object-cover"
                  src={offender.mugshotUrl}
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-foreground/20 bg-foreground/5">
                <p className="text-center text-foreground/60">No mugshot available</p>
              </div>
            )}
            <div>
              <Link href={`/admin/dashboard/tools/mugshot-upload?inmateNumber=${offender.inmateNumber}`}>
                <Button className="button-link w-full" variant="default">
                  {offender.mugshotUrl ? "Update Mugshot" : "Upload Mugshot"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="font-black text-2xl text-foreground mb-4">
              Inmate Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <div className="card-content p-3">
                <p className="text-lg font-bold">Inmate Number:</p>
                <p className="text-md mt-1">{offender.inmateNumber}</p>
              </div>
              {offender.nmcdNumber && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">NMCD Number:</p>
                  <p className="text-md mt-1">{offender.nmcdNumber}</p>
                </div>
              )}
              <div className="card-content p-3">
                <p className="text-lg font-bold">Status:</p>
                <p className="text-md mt-1">{offender.status}</p>
              </div>
              {offender.facility && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Facility:</p>
                  <p className="text-md mt-1">{offender.facility}</p>
                </div>
              )}
              {typeof offender.age === "number" && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Age:</p>
                  <p className="text-md mt-1">{offender.age}</p>
                </div>
              )}
              {offender.height && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Height:</p>
                  <p className="text-md mt-1">{offender.height}</p>
                </div>
              )}
              {typeof offender.weight === "number" && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Weight:</p>
                  <p className="text-md mt-1">{offender.weight}</p>
                </div>
              )}
              {offender.eyeColor && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Eye Color:</p>
                  <p className="text-md mt-1">{offender.eyeColor}</p>
                </div>
              )}
              {offender.hair && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Hair:</p>
                  <p className="text-md mt-1">{offender.hair}</p>
                </div>
              )}
              {offender.religion && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Religion:</p>
                  <p className="text-md mt-1">{offender.religion}</p>
                </div>
              )}
              {offender.education && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Education:</p>
                  <p className="text-md mt-1">{offender.education}</p>
                </div>
              )}
              {offender.complexion && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Complexion:</p>
                  <p className="text-md mt-1">{offender.complexion}</p>
                </div>
              )}
              {offender.ethnicity && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Ethnicity:</p>
                  <p className="text-md mt-1">{offender.ethnicity}</p>
                </div>
              )}
              {offender.alias && (
                <div className="card-content p-3">
                  <p className="text-lg font-bold">Alias:</p>
                  <p className="text-md mt-1">{offender.alias}</p>
                </div>
              )}
              <div className="card-content p-3">
                <p className="text-lg font-bold">Custody Status:</p>
                <p className="text-md mt-1">{offender.custodyStatus}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/dashboard/tools/offender-profile?inmateNumber=${offender.inmateNumber}`}>
                <Button className="button-link" variant="default">
                  Edit Profile
                </Button>
              </Link>
              <Button className="button-link" variant="default">
                Notify Inmate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Tab */}
      <Card className="card-content">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-kings text-foreground">Cases</CardTitle>
          <Link href={`/admin/dashboard/tools/case-upload?inmateNumber=${offender.inmateNumber}`}>
            <Button className="button-link" size="sm" variant="default">
              Add Case
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="card-content p-4 text-center">
              <p className="text-foreground/60">No cases found for this inmate.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-foreground/20">
              <table className="w-full border-collapse">
                <thead className="bg-foreground/10">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Case Number</th>
                    <th className="px-4 py-2 text-left font-medium">Court</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Next Date</th>
                    <th className="px-4 py-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-t border-foreground/10 hover:bg-foreground/5">
                      <td className="px-4 py-2">{caseItem.caseNumber}</td>
                      <td className="px-4 py-2">{caseItem.court}</td>
                      <td className="px-4 py-2">{caseItem.status}</td>
                      <td className="px-4 py-2">
                        {caseItem.nextDate
                          ? new Date(caseItem.nextDate).toLocaleDateString()
                          : "None"}
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/admin/dashboard/cases/${caseItem.id}`}>
                          <Button className="button-link" size="sm" variant="default">
                            View
                          </Button>
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
    </div>
  );
}
