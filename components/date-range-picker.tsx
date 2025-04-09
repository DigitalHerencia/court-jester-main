// ✅ Path: components/date-range-picker.tsx
"use client";

import type React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  /** Optional array of dates to highlight on the calendar */
  highlightedDates?: Date[];
}

export function DateRangePicker({ className, dateRange, setDateRange, highlightedDates, ...props }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            id="date"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            initialFocus
            defaultMonth={dateRange?.from}
            mode="range"
            modifiers={highlightedDates ? { highlighted: highlightedDates } : {}}
            modifiersClassNames={
              highlightedDates
                ? { highlighted: "bg-primary/40 text-foreground font-bold border border-primary/30" }
                : undefined
            }
            numberOfMonths={2}
            selected={dateRange}
            onSelect={setDateRange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
