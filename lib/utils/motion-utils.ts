/**
 * Processes a motion template by replacing placeholders with actual values
 * @param template The motion template content
 * @param variables Object containing variable values to replace placeholders
 * @returns Processed motion content
 */
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

/**
 * Extracts placeholders from a motion template
 * @param template The motion template content
 * @returns Array of placeholder names
 */
export function extractPlaceholders(template: string): string[] {
  if (!template) return []

  const placeholderRegex = /{{([^}]+)}}/g
  const placeholders: string[] = []
  let match

  while ((match = placeholderRegex.exec(template)) !== null) {
    // Extract the placeholder name and trim whitespace
    const placeholder = match[1].trim()
    if (!placeholders.includes(placeholder)) {
      placeholders.push(placeholder)
    }
  }

  return placeholders
}

/**
 * Validates a motion for submission
 * @param content The motion content
 * @returns Object with validation result and any error messages
 */
export function validateMotionForSubmission(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check if the content is empty
  if (!content || content.trim() === "") {
    errors.push("Motion content cannot be empty")
  }

  // Check if there are any remaining placeholders
  const remainingPlaceholders = extractPlaceholders(content)
  if (remainingPlaceholders.length > 0) {
    errors.push(`Motion contains unfilled placeholders: ${remainingPlaceholders.join(", ")}`)
  }

  // Check minimum content length (arbitrary example)
  if (content && content.length < 100) {
    errors.push("Motion content is too short (minimum 100 characters)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Gets the status label and color for a motion status
 * @param status The motion status
 * @returns Object with label and color information
 */
export function getMotionStatusInfo(status: string): { label: string; color: string } {
  switch (status?.toLowerCase()) {
    case "draft":
      return { label: "Draft", color: "bg-yellow-100 text-yellow-800" }
    case "submitted":
      return { label: "Submitted", color: "bg-blue-100 text-blue-800" }
    case "approved":
      return { label: "Approved", color: "bg-green-100 text-green-800" }
    case "rejected":
      return { label: "Rejected", color: "bg-red-100 text-red-800" }
    case "filed":
      return { label: "Filed", color: "bg-purple-100 text-purple-800" }
    default:
      return { label: status || "Unknown", color: "bg-gray-100 text-gray-800" }
  }
}

