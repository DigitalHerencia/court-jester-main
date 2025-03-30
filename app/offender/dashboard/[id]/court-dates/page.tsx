"use client";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface CourtDate {
  id: number;
  case_id: number;
  case_number: string;
  date: string;
  time: string;
  location: string;
  type: string;
  notes?: string;
}

export default function CourtDatesPage() {
  const { id } = useParams<{ id: string }>();
  const [courtDates, setCourtDates] = useState<CourtDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredDates, setFilteredDates] = useState<CourtDate[]>([]);

  useEffect(() => {
    async function fetchCourtDates() {
      try {
        const response = await fetch(`/api/offenders/${id}/court-dates`);
        if (!response.ok) {
          throw new Error("Failed to fetch court dates");
        }
        const data = await response.json();
        setCourtDates(data.courtDates || []);
      } catch (error) {
        console.error("Error fetching court dates:", error);
        setError("Failed to load court dates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchCourtDates();
    }
  }, [id]);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredDates([]);
      return;
    }
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const filtered = courtDates.filter((courtDate) => {
      const dateObj = new Date(courtDate.date);
      dateObj.setHours(0, 0, 0, 0);
      return dateObj.getTime() === selected.getTime();
    });
    setFilteredDates(filtered);
  }, [selectedDate, courtDates]);

  // Dates with court appearances (for calendar highlights)
  const getCourtDateHighlights = () => courtDates.map((courtDate) => new Date(courtDate.date));

  if (isLoading) {
    return <div>Loading court dates...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Court Dates</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <Calendar
            autoFocus
            mode="single"
            modifiers={{ highlighted: getCourtDateHighlights() }}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold">Scheduled Appearances</h2>
          {filteredDates.length === 0 ? (
            <p>No court dates on this day.</p>
          ) : (
            filteredDates.map((courtDate) => (
              <Card key={courtDate.id}>
                <CardHeader>
                  <CardTitle>{new Date(courtDate.date).toLocaleDateString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Case:</strong> {courtDate.case_number}</p>
                  <p><strong>Time:</strong> {courtDate.time}</p>
                  <p><strong>Location:</strong> {courtDate.location}</p>
                  <p><strong>Type:</strong> {courtDate.type}</p>
                  {courtDate.notes && <p><strong>Notes:</strong> {courtDate.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
