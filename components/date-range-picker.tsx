"use client"

import type * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
}: React.HTMLAttributes<HTMLDivElement> & {
  dateRange: DateRange | undefined
  setDateRange: (dateRange: DateRange | undefined) => void
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            id="date"
            variant={"outline"}
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
            numberOfMonths={2}
            selected={dateRange}
            onSelect={setDateRange}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
