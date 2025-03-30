/**
 * Gets the status label and color for a case status
 * @param status The case status
 * @returns Object with label and color information
 */
export function getCaseStatusInfo(status: string): { label: string; color: string } {
  switch (status?.toLowerCase()) {
    case "active":
      return { label: "Active", color: "bg-green-100 text-green-800" }
    case "closed":
      return { label: "Closed", color: "bg-red-100 text-red-800" }
    case "pending":
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800" }
    case "suspended":
      return { label: "Suspended", color: "bg-orange-100 text-orange-800" }
    case "appealed":
      return { label: "Appealed", color: "bg-blue-100 text-blue-800" }
    default:
      return { label: status || "Unknown", color: "bg-gray-100 text-gray-800" }
  }
}

/**
 * Gets the severity label and color for a charge severity
 * @param severity The charge severity
 * @returns Object with label and color information
 */
export function getChargeSeverityInfo(severity: string): { label: string; color: string } {
  switch (severity?.toLowerCase()) {
    case "felony":
      return { label: "Felony", color: "bg-red-100 text-red-800" }
    case "misdemeanor":
      return { label: "Misdemeanor", color: "bg-yellow-100 text-yellow-800" }
    case "infraction":
      return { label: "Infraction", color: "bg-blue-100 text-blue-800" }
    case "violation":
      return { label: "Violation", color: "bg-purple-100 text-purple-800" }
    default:
      return { label: severity || "Unknown", color: "bg-gray-100 text-gray-800" }
  }
}

/**
 * Gets the disposition label and color for a charge disposition
 * @param disposition The charge disposition
 * @returns Object with label and color information
 */
export function getChargeDispositionInfo(disposition: string): { label: string; color: string } {
  switch (disposition?.toLowerCase()) {
    case "guilty":
      return { label: "Guilty", color: "bg-red-100 text-red-800" }
    case "not guilty":
      return { label: "Not Guilty", color: "bg-green-100 text-green-800" }
    case "dismissed":
      return { label: "Dismissed", color: "bg-blue-100 text-blue-800" }
    case "pending":
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800" }
    case "plea bargain":
      return { label: "Plea Bargain", color: "bg-purple-100 text-purple-800" }
    default:
      return { label: disposition || "Unknown", color: "bg-gray-100 text-gray-800" }
  }
}

/**
 * Formats a case number for display
 * @param caseNumber The case number to format
 * @returns Formatted case number
 */
export function formatCaseNumber(caseNumber: string): string {
  if (!caseNumber) return "N/A"

  // Example formatting logic - adjust based on your case number format
  // This example assumes case numbers like "12345" and formats to "Case #12345"
  if (!caseNumber.toLowerCase().startsWith("case")) {
    return `Case #${caseNumber}`
  }

  return caseNumber
}

/**
 * Parses case information from a document text
 * @param text The document text to parse
 * @returns Parsed case information or null if parsing fails
 */
export function parseCaseInfoFromDocument(text: string): any | null {
  if (!text) return null

  try {
    // This is a simplified example of parsing case information from text
    // In a real application, you would use more sophisticated parsing techniques

    // Extract case number (example format: "Case Number: ABC-12345")
    const caseNumberMatch = text.match(/Case Number:?\s*([A-Za-z0-9-]+)/i)
    const caseNumber = caseNumberMatch ? caseNumberMatch[1] : null

    // Extract court (example format: "Court: Superior Court of California")
    const courtMatch = text.match(/Court:?\s*([^\n]+)/i)
    const court = courtMatch ? courtMatch[1].trim() : null

    // Extract judge (example format: "Judge: John Smith")
    const judgeMatch = text.match(/Judge:?\s*([^\n]+)/i)
    const judge = judgeMatch ? judgeMatch[1].trim() : null

    // Extract charges (example format: "Charges: Assault, Battery")
    const chargesMatch = text.match(/Charges:?\s*([^\n]+)/i)
    const chargesText = chargesMatch ? chargesMatch[1].trim() : null

    // Parse charges into an array
    const charges = chargesText
      ? chargesText.split(",").map((charge) => ({
          description: charge.trim(),
          statute: null,
          severity: null,
        }))
      : []

    // If we couldn't extract the basic information, return null
    if (!caseNumber && !court) {
      return null
    }

    return {
      case_number: caseNumber,
      court,
      judge,
      charges,
    }
  } catch (error) {
    console.error("Error parsing case information:", error)
    return null
  }
}

