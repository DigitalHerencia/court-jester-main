// lib/pdf-parser.ts

/**
 * Interfaces matching your Postgres tables.
 */
export interface Case {
  case_number: string;
  court: string;
  judge: string;
  filing_date: Date;
  offender_id?: number;
  case_type?: string;
  plaintiff?: string;
  defendant?: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  next_date?: Date;
}

export interface Charge {
  case_id?: number; // to be linked later
  count_number: number;
  statute: string;
  description: string;
  class?: string;
  charge_date: Date;
  citation_number: string;
  plea: string;
  disposition?: string;
  disposition_date?: Date;
  created_at?: Date;
}

export interface Hearing {
  case_id?: number; // to be linked later
  hearing_date: Date;
  hearing_time: string;
  hearing_type: string;
  hearing_judge: string;
  court: string;
  court_room: string;
  created_at?: Date;
}

export interface MotionFiling {
  case_id?: number; // to be linked later
  title: string;
  content: string;
  filing_date: Date;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ParsedCaseData {
  caseDetail: Case;
  charges: Charge[];
  hearings: Hearing[];
  motionFilings: MotionFiling[];
}

/**
 * Main function to parse a CSV buffer.
 * The CSV is expected to be structured into 4 sections with comment header lines:
 *   # Cases Table
 *   # Charges Table
 *   # Hearings Table
 *   # Motion Filings Table
 */
export async function parseCsvBuffer(buffer: Buffer): Promise<ParsedCaseData> {
  const csvContent = buffer.toString("utf-8");
  const lines = csvContent.split("\n");

  // Locate the section markers
  const caseSectionIndex = lines.findIndex(line =>
    line.trim().startsWith("# Cases Table")
  );
  const chargesSectionIndex = lines.findIndex(line =>
    line.trim().startsWith("# Charges Table")
  );
  const hearingsSectionIndex = lines.findIndex(line =>
    line.trim().startsWith("# Hearings Table")
  );
  const motionSectionIndex = lines.findIndex(line =>
    line.trim().startsWith("# Motion Filings Table")
  );

  // Helper: Parse a section from startIndex (exclusive header) to endIndex (exclusive)
  function parseSection(startIndex: number, endIndex: number): string[][] {
    const sectionLines = lines.slice(startIndex + 1, endIndex);
    // Filter out blank lines
    return sectionLines
      .filter(line => line.trim() !== "")
      .map(line =>
        // Simple CSV split (assumes no commas within quoted values)
        line.split(",").map((val) => val.trim())
      );
  }

  // Determine the end of each section using the next section's index or the file end.
  const caseSectionRows = parseSection(caseSectionIndex, chargesSectionIndex);
  const chargesSectionRows = parseSection(chargesSectionIndex, hearingsSectionIndex);
  const hearingsSectionRows = parseSection(hearingsSectionIndex, motionSectionIndex);
  const motionSectionRows = parseSection(motionSectionIndex, lines.length);

  // Helper: Map rows into objects using header row.
  function parseTable<T>(rows: string[][], rowMapper: (row: Record<string, string>) => T): T[] {
    if (rows.length === 0) return [];
    const header = rows[0];
    const dataRows = rows.slice(1);
    return dataRows.map(row => {
      const record: Record<string, string> = {};
      header.forEach((col, i) => {
        record[col] = row[i] || "";
      });
      return rowMapper(record);
    });
  }

  // Helper: Parse dates from CSV (ISO or date-time strings)
  function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const caseData = parseTable<Case>(caseSectionRows, (record) => ({
    case_number: record["case_number"],
    court: record["court"],
    judge: record["judge"],
    filing_date: parseDate(record["filing_date"]) || new Date(),
    offender_id: record["offender_id"] ? parseInt(record["offender_id"], 10) : undefined,
    case_type: record["case_type"] || undefined,
    plaintiff: record["plaintiff"] || undefined,
    defendant: record["defendant"] || undefined,
    status: record["status"],
    created_at: record["created_at"] ? new Date(record["created_at"]) : undefined,
    updated_at: record["updated_at"] ? new Date(record["updated_at"]) : undefined,
    next_date: record["next_date"] ? new Date(record["next_date"]) : undefined,
  }));

  const chargesData = parseTable<Charge>(chargesSectionRows, (record) => ({
    case_id: record["case_id"] ? parseInt(record["case_id"], 10) : undefined,
    count_number: record["count_number"] ? parseInt(record["count_number"], 10) || 1 : 1, // Default to 1 if invalid
    statute: record["statute"] || "",
    description: record["description"] || "",
    class: record["class"] || undefined,
    charge_date: parseDate(record["charge_date"]) || new Date(),
    citation_number: record["citation_number"] || "",
    plea: record["plea"] || "",
    disposition: record["disposition"] || undefined,
    disposition_date: record["disposition_date"] ? new Date(record["disposition_date"]) : undefined,
    created_at: record["created_at"] ? new Date(record["created_at"]) : undefined,
  }));

  const hearingsData = parseTable<Hearing>(hearingsSectionRows, (record) => ({
    case_id: record["case_id"] ? parseInt(record["case_id"], 10) : undefined,
    hearing_date: parseDate(record["hearing_date"]) || new Date(),
    hearing_time: record["hearing_time"],
    hearing_type: record["hearing_type"],
    hearing_judge: record["hearing_judge"],
    court: record["court"],
    court_room: record["court_room"],
    created_at: record["created_at"] ? new Date(record["created_at"]) : undefined,
  }));

  const motionFilingsData = parseTable<MotionFiling>(motionSectionRows, (record) => ({
    case_id: record["case_id"] ? parseInt(record["case_id"], 10) : undefined,
    title: record["title"],
    content: record["content"],
    filing_date: parseDate(record["filing_date"]) || new Date(),
    status: record["status"],
    created_at: record["created_at"] ? new Date(record["created_at"]) : undefined,
    updated_at: record["updated_at"] ? new Date(record["updated_at"]) : undefined,
  }));

  // Expect one case row
  const caseDetail = caseData.length > 0 ? caseData[0] : {
    case_number: "N/A",
    judge: "N/A",
    filing_date: new Date(),
    court: "N/A",
    status: "Error",
  };

  return {
    caseDetail,
    charges: chargesData,
    hearings: hearingsData,
    motionFilings: motionFilingsData,
  };
}
