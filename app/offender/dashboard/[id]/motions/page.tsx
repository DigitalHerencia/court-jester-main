"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText } from "lucide-react";

interface Motion {
  id: number;
  title: string;
  status: string;
  created_at: string;
  case_number: string;
  has_pdf: boolean;
}

export default function OffenderMotionsPage({ params }: { params: { id: string } }) {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMotions() {
      try {
        const response = await fetch(`/api/offenders/${params.id}/motions`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch motions");
        }
        const data = await response.json();
        setMotions(data.motions || []);
      } catch (error) {
        console.error("Error fetching motions:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load motions. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchMotions();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading motions...</div>
          <div className="text-foreground/60">
            Please wait while we fetch your motion data.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Error</div>
          <div className="mb-4 text-foreground/60">{error}</div>
          <Button className="bg-foreground text-background" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Motions</h1>
      {motions.length === 0 ? (
        <div className="rounded-md border border-foreground/20 p-8 text-center">
          <div className="mb-2 text-xl font-semibold">No motions found</div>
          <p className="text-foreground/60">You don&apos;t have any motions in the system yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {motions.map((motion) => (
            <Card key={motion.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{motion.title}</CardTitle>
                  <Badge variant={motion.status === "approved" ? "default" : "outline"}>
                    {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Case:</span> {motion.case_number}
                  </div>
                  <div>
                    <span className="font-medium">Filed:</span> {formatDate(motion.created_at)}
                  </div>
                  {motion.has_pdf && (
                    <div className="text-green-600">
                      <FileText className="mr-1 inline-block h-4 w-4" />
                      PDF Available
                    </div>
                  )}
                </div>
                <Link href={`/offender/dashboard/${params.id}/motions/${motion.id}`}>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
