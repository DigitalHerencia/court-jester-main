"use client"

import { useRouter, usePathname } from "next/navigation";

// Client-side logout function
async function logout() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (res.ok) {
    // Redirect to the login/home page (adjust the URL as needed)
    window.location.href = "/";
  } else {
    console.error("Failed to logout");
  }
}

export function AdminDashboardHeader() {
  return (
    <header className="mb-2 flex items-center justify-between">
      <h1 className="font-jacquard text-4xl font-normal">Admin Dashboard</h1>
      <button
        onClick={logout}
        className="bg-foreground text-background text-lg font-kings rounded-md px-4 py-2 hover:bg-foreground/90"
      >
        Logout
      </button>
    </header>
  );
}

export function OffenderDashboardHeader() {
  return (
    <header className="mb-2 flex items-center justify-between">
      <h1 className="font-jacquard text-4xl font-normal">Offender Dashboard</h1>
      <button
        onClick={logout}
        className="bg-foreground text-background text-lg font-kings rounded-md px-4 py-2 hover:bg-foreground/90"
      >
        Logout
      </button>
    </header>
  );
}

export function DashboardHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/admin/");
  return (
    <header className="mb-2 flex items-center justify-between">
      <h1 className="font-jacquard text-4xl font-normal">
        {isAdmin ? "Admin Dashboard" : "Offender Dashboard"}
      </h1>
      <button
        onClick={logout}
        className="bg-foreground text-background text-lg font-kings rounded-md px-4 py-2 hover:bg-foreground/90"
      >
        Logout
      </button>
    </header>
  );
}
