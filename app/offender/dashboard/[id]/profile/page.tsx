"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Offender {
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
  // Removed date_of_birth as it does not exist in your database
  gender: string;
  race: string;
  ethnicity: string;
  mugshot_url?: string;
}

export default function OffenderProfilePage() {
  const { id } = useParams<{ id: string }>(); // id is the inmate number (e.g. "468079")
  const [offender, setOffender] = useState<Offender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchOffenderData() {
      try {
        // Include credentials so the HTTP‑only token cookie is sent
        const res = await fetch(`/api/offenders/${id}/profile`, { credentials: "include" });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch offender profile data");
        }
        // API returns the offender object directly.
        const data: Offender = await res.json();
        setOffender(data);
      } catch (err: unknown) {
        console.error("Error fetching offender profile data:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffenderData();
  }, [id]);

  const handlePrintProfile = () => {
    window.print();
    toast.success("Printing profile...");
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error || !offender)
    return (
      <div>
        <p>Error: {error || "Failed to load profile data"}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offender Profile</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mugshot and Basic Info */}
        <div className="border p-6 rounded-md">
          <div className="flex items-center gap-4">
            <div className="relative h-40 w-32 border rounded-md overflow-hidden">
              {offender.mugshot_url ? (
                <Image fill alt="Mugshot" src={offender.mugshot_url} style={{ objectFit: "cover" }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  No mugshot available
                </div>
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
        </div>
        {/* Additional Information */}
        <div className="border p-6 rounded-md">
          <h2 className="text-lg font-semibold">Additional Information</h2>
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
            <strong>Gender:</strong> {offender.gender}
          </p>
          <p>
            <strong>Race:</strong> {offender.race}
          </p>
          <p>
            <strong>Ethnicity:</strong> {offender.ethnicity}
          </p>
        </div>
      </div>
      <Button onClick={handlePrintProfile}>Print Profile</Button>
    </div>
  );
}
