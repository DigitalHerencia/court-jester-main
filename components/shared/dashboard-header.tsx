// components/shared/dashboard-header.tsx
"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

/**
 * Logs out the user and redirects to home.
 */
async function logout() {
  try {
    const res = await fetch("/api/auth/logout", { method: "GET" });
    if (res.ok) {
      window.location.href = "/";
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

export function AdminDashboardHeader() {
  return (
    <header className="flex justify-between items-center py-4 mb-2.5">
      <Link className="font-jacquard text-5xl sm:text-5xl" href="/admin/dashboard">
        Court Jester
      </Link>
      <Button
        className="bg-foreground text-background hover:bg-foreground/90 font-kings px-4 py-2 rounded-md"
        onClick={logout}
      >
        Logout
      </Button>
    </header>
  );
}

export function OffenderDashboardHeader() {
  return (
    <header className="flex justify-between items-center py-4 mb-2.5">
      <Link className="font-jacquard text-5xl sm:text-5xl" href="/offender/dashboard">
        Court Jester
      </Link>
      <Button
        className="bg-foreground text-background hover:bg-foreground/90 font-kings px-4 py-2 rounded-md"
        onClick={logout}
      >
        Logout
      </Button>
    </header>
  );
}

export function DashboardHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin/");

  return isAdmin ? <AdminDashboardHeader /> : <OffenderDashboardHeader />;
}
