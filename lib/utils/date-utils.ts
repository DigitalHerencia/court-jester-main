/**
 * Formats a date string or Date object into a localized date string
 * @param date Date string or Date object
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

/**
 * Formats a date string or Date object into a localized time string
 * @param date Date string or Date object
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted time string
 */
export function formatTime(date: string | Date, locale = "en-US"): string {
  if (!date) return "N/A"

  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formats a date string or Date object into a localized date and time string
 * @param date Date string or Date object
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date, locale = "en-US"): string {
  if (!date) return "N/A"

  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Checks if a date is in the past
 * @param date Date string or Date object
 * @returns Boolean indicating if the date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  if (!date) return false

  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()

  // Set time to midnight for date comparison
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return dateOnly < nowOnly
}

/**
 * Checks if a date is today
 * @param date Date string or Date object
 * @returns Boolean indicating if the date is today
 */
export function isToday(date: string | Date): boolean {
  if (!date) return false

  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()

  return (
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()
  )
}

/**
 * Gets the number of days between two dates
 * @param startDate Start date string or Date object
 * @param endDate End date string or Date object
 * @returns Number of days between the dates
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  if (!startDate || !endDate) return 0

  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate

  // Set time to midnight for date comparison
  const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  // Calculate difference in days
  const diffTime = Math.abs(endOnly.getTime() - startOnly.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Gets a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date Date string or Date object
 * @param locale Locale string (default: 'en-US')
 * @returns Relative time string
 */
export function getRelativeTimeString(date: string | Date, locale = "en-US"): string {
  if (!date) return "N/A"

  const dateObj = typeof date === "string" ? new Date(date) : date

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const now = new Date()
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000)

  // Define time units and their values in seconds
  const units: [string, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ]

  // Find the appropriate unit
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit || unit === "second") {
      const value = Math.round(diffInSeconds / secondsInUnit)
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit)
    }
  }

  return "just now"
}

