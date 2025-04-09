"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-3xl font-black",
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-12 bg-foreground text-background p-0  hover:opacity-100"
        ),
        nav_button_previous: "absolute xl:left-120 lg:left-70 md:left-40 sm:left-30",
        nav_button_next: "absolute xl:right-120 lg:right-70 md:right-40 sm:right-30",
        table: "flex flex-col pt-3",
        head_row: "flex items-center justify-center",
        head_cell:
          "text-foreground rounded-md w-18 pb-4  font-bold text-xl",
        row: "flex items-center justify-center gap-1.5",
        cell: 
          " text-center text-md focus-within:relative ",
        
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-16  font-normal text-xl aria-selected:opacity-100"
        ),
        
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}

export { Calendar }
