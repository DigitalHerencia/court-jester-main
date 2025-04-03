"use client";

import React, { type JSX } from "react";

/**
 * DashboardLoading shows a consistent loading indicator.
 * @returns {JSX.Element} Loading spinner.
 */
export default function DashboardLoading(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="text-center">
        <p className="text-xl font-bold">Loading Dashboard...</p>
      </div>
    </div>
  );
}
