// lib/utils/case-utils.ts

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

  if (!caseNumber.toLowerCase().startsWith("case")) {
    return `Case #${caseNumber}`
  }

  return caseNumber
}

/**
 * Parses case information from a CSV row.
 * This function assumes the row is from the "Cases Table" of the new CSV format.
 * @param row A CSV row object with case information
 * @returns Parsed case information or null if parsing fails
 */
export function parseCaseInfoFromCsvRow(row: Record<string, string>): any | null {
  if (!row) return null

  try {
    // Map CSV columns to case properties based on the new CSV header names.
    const case_number = row["case_number"] || row["Case Number"] || null;
    const court = row["court"] || row["Court"] || null;
    const judge = row["judge"] || row["Judge"] || null;
    const filing_date = row["filing_date"] || row["Filing Date"] || null;
    const offender_id = row["offender_id"] || row["Offender ID"] || null;
    const case_type = row["case_type"] || row["Case Type"] || null;
    const plaintiff = row["plaintiff"] || row["Plaintiff"] || null;
    const defendant = row["defendant"] || row["Defendant"] || null;
    const status = row["status"] || row["Status"] || "Active";
    const created_at = row["created_at"] || row["Created At"] || null;
    const updated_at = row["updated_at"] || row["Updated At"] || null;
    const next_date = row["next_date"] || row["Next Date"] || null;

    // Ensure that required fields are available.
    if (!case_number || !court) {
      return null;
    }

    return {
      case_number,
      court,
      judge,
      filing_date: filing_date ? new Date(filing_date) : new Date(),
      offender_id: offender_id ? parseInt(offender_id, 10) : undefined,
      case_type,
      plaintiff,
      defendant,
      status,
      created_at: created_at ? new Date(created_at) : undefined,
      updated_at: updated_at ? new Date(updated_at) : undefined,
      next_date: next_date ? new Date(next_date) : undefined,
    }
  } catch (error) {
    console.error("Error parsing case information from CSV row:", error);
    return null;
  }
}
