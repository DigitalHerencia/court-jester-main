import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract variables from template content
export function extractVariables(content: string): string[] {
  const matches = content.match(/{{([^}]+)}}/g) || []
  return matches.map((match) => match.slice(2, -2).trim())
}

// Process a motion template by replacing variables with values
export function processMotionTemplate(template: string, variables: Record<string, string>): string {
  if (!template) return ""

  // Replace all placeholders in the format {{variable_name}}
  let processedContent = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g")
    processedContent = processedContent.replace(placeholder, value || "")
  }

  // Highlight any remaining placeholders that weren't replaced
  processedContent = processedContent.replace(
    /{{([^}]+)}}/g,
    '<span style="background-color: yellow; color: black;">{{$1}}</span>',
  )

  return processedContent
}

// Format a date string
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

