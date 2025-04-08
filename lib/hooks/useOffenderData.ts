// hooks/useOffenderData.ts

"use client";

import { useEffect, useState } from "react";

export function useOffenderId() {
  const [offenderId, setOffenderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchId() {
      try {
        const res = await fetch("/api/offenders/me");
        if (!res.ok) throw new Error("Failed to fetch offenderId");
        const data = await res.json();
        setOffenderId(data.offenderId);
      } catch (err) {
        console.error("Error fetching offenderId:", err);
        setError("Could not retrieve your profile.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchId();
  }, []);

  return { offenderId, isLoading, error };
}

export function useOffenderProfile(offenderId: number | null) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offenderId) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/offenders/${offenderId}/profile`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.offender);
      } catch (err) {
        console.error("Error fetching offender profile:", err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [offenderId]);

  return { profile, isLoading, error };
}
