// app/offender/dashboard/[id]/profile/page.tsx
"use client";

import { useOffenderId, useOffenderProfile } from "@/lib/hooks/useOffenderData";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function OffenderProfilePage() {
  const { offenderId, isLoading: loadingId, error: errorId } = useOffenderId();
  const offenderIdAsNumber = Number(offenderId);
  const { profile, isLoading: loadingProfile, error: errorProfile } = useOffenderProfile(offenderIdAsNumber);

  if (loadingId || loadingProfile) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-background">Loading profile...</div>
          <div className="text-foreground/60">Please wait while we fetch your data.</div>
        </div>
      </div>
    );
  }

  const fatalError = errorId || errorProfile;
  if (fatalError) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{fatalError}</div>
          <Button variant="default" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const fullName = `${profile.firstName} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName}`;

  return (
    <div className="card-secondary space-y-4 p-4">
      <div className="card-primary p-4">
        <h1 className="font-kings text-3xl text-primary-foreground mb-2">Inmate: {fullName}</h1>
        <p className="text-primary-foreground">View all details related to your account.</p>
      </div>

      <div className="card-content space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-4">
            {profile.mugshotUrl ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-foreground/20">
                <Image
                  fill
                  alt={`Mugshot of ${fullName}`}
                  className="object-cover"
                  src={profile.mugshotUrl}
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-foreground/20 bg-foreground/5">
                <p className="text-center text-foreground/60">No mugshot available</p>
              </div>
            )}
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="font-black text-2xl text-foreground mb-4">Inmate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {Object.entries(profile).map(([key, value]) => {
                if (!value || key === "mugshotUrl") return null;
                const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                return (
                  <div key={key} className="card-content p-3">
                    <p className="text-lg font-bold">{label}:</p>
                    <p className="text-md mt-1">{String(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
