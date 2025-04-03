"use client";

import React, { type JSX } from "react";
import { Loader2 } from "lucide-react";

/**
 * OffenderProfileLoading component for profile page loading state.
 * @returns {JSX.Element} Loading indicator.
 */
export default function OffenderProfileLoading(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
