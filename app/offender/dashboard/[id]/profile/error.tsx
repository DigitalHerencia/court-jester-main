// app/offender/dashboard/[id]/profile/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Profile Page Error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-foreground/60 mb-4">
          The system failed to load your profile. Try again or report the issue.
        </p>
        <Button variant="default" onClick={() => reset()}>
          Retry
        </Button>
      </div>
    </div>
  );
}
