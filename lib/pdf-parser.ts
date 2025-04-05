// pdf-parser.ts

import * as pdfjs from 'pdfjs-dist';
import type { ParsedCase } from "@/app/admin/dashboard/tools/case-upload/page";

// No need to set up worker when using legacy build

/**
 * Extracts text from a PDF file using PDF.js
 */
async function extractTextFromPDF(data: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({ data }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => {
          if ('str' in item && typeof item.str === 'string') {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error("Failed to extract text from PDF");
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to parse PDF file: " + (error instanceof Error ? error.message : String(error)));
  }
}


function extractTableData(text: string, sectionHeader: string, numHeaderLines = 1): string[][] {
  const headers = [
    "CASE DETAIL",
    "PARTIES TO THIS CASE",
    "CRIMINAL CHARGE DETAIL",
    "HEARINGS FOR THIS CASE",
    "REGISTER OF ACTIONS ACTIVITY"
  ];
  const start = text.indexOf(sectionHeader);
  if (start === -1) return [];
  let end = text.length;
  for (const h of headers) {
    if (h === sectionHeader) continue;
    const idx = text.indexOf(h, start + sectionHeader.length);
    if (idx !== -1 && idx < end) {
      end = idx;
    }
  }
  const sectionText = text.substring(start, end);
  const lines = sectionText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");
  const dataLines = lines.slice(numHeaderLines);
  return dataLines.map(line => line.split(/\s{1,}/));
}

/**
 * Validates if a date string matches format YYYY-MM-DD
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates that all required fields are present
 */
function validateParsedCase(parsedCase:  ParsedCase): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!parsedCase.case_number) {
    errors.push("Case number is required");
  }
  if (!parsedCase.court) {
    errors.push("Court is required");
  }
  if (!parsedCase.filing_date || !isValidDate(parsedCase.filing_date)) {
    errors.push("Valid filing date is required");
  }

  // Validate charges
  parsedCase.charges.forEach((charge, index) => {
    if (!charge.statute) {
      errors.push(`Charge ${index + 1}: Statute is required`);
    }
    if (!charge.description) {
      errors.push(`Charge ${index + 1}: Description is required`);
    }
  });

  // Validate hearings
  parsedCase.hearings.forEach((hearing, index) => {
    if (!hearing.hearing_date || !isValidDate(hearing.hearing_date)) {
      errors.push(`Hearing ${index + 1}: Valid hearing date is required`);
    }
    if (!hearing.hearing_type) {
      errors.push(`Hearing ${index + 1}: Hearing type is required`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitizes text input to prevent malformed data
 */
function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
}

/**
 * Parses a case PDF by extracting its text with pdf-parse, then processing
 * various sections to build a ParsedCase object.
 */
export async function parseCasePdf(
  pdfData: ArrayBuffer,
): Promise<{ success: boolean; case?:  ParsedCase; error?: string; warnings?: string[] }> {
  try {
    const warnings: string[] = [];
    const text = await extractTextFromPDF(pdfData);

    if (!text || text.trim().length === 0) {
      throw new Error("PDF appears to be empty or could not be read");
    }

    // Parse Case Detail
    const caseDetailRows = extractTableData(text, "CASE DETAIL");
    if (caseDetailRows.length === 0 || caseDetailRows[0].length < 4) {
      throw new Error("Failed to extract case details from PDF - required case detail section not found");
    }

    const [caseNumRaw, judgeRaw, filingDateRaw, courtRaw] = caseDetailRows[0];
    const case_number = sanitizeText(caseNumRaw || "");
    const judge = sanitizeText(judgeRaw || "");
    const filing_date = sanitizeText(filingDateRaw || "");
    const court = sanitizeText(courtRaw || "");
    const case_type = case_number.includes("-CV-") ? "Civil" : "Criminal";

    // Parse Parties
    const partiesRows = extractTableData(text, "PARTIES TO THIS CASE");
    let plaintiff = "";
    let defendant = "";
    for (const row of partiesRows) {
      if (row.length >= 4) {
        const partyType = row[0].toUpperCase();
        const partyName = sanitizeText(row[3] || "");
        if (partyType.startsWith("P")) {
          plaintiff = partyName;
        } else if (partyType.startsWith("D")) {
          defendant = partyName;
        }
      }
    }

    // Parse Charges with better validation
    const charges: ParsedCase["charges"] = [];
    const chargesRows = extractTableData(text, "CRIMINAL CHARGE DETAIL");
    let count_number = 1;
    for (const row of chargesRows) {
      if (row.length >= 11) {
        charges.push({
          count_number,
          statute: sanitizeText(row[3] || ""),
          description: sanitizeText(row[4] || ""),
          class: sanitizeText(row[5] || ""),
          charge_date: sanitizeText(row[6] || ""),
          citation_number: sanitizeText(row[7] || ""),
          plea: sanitizeText(row[8] || ""),
          disposition: sanitizeText(row[9] || ""),
          disposition_date: sanitizeText(row[10] || "")
        });
        count_number++;
      } else if (row.length > 0) {
        warnings.push(`Skipped incomplete charge data at row ${count_number}`);
      }
    }

    // Parse Hearings with better validation
    const hearings: ParsedCase["hearings"] = [];
    const hearingsRows = extractTableData(text, "HEARINGS FOR THIS CASE");
    for (const row of hearingsRows) {
      if (row.length >= 6) {
        const hearing = {
          hearing_date: sanitizeText(row[0] || ""),
          hearing_time: sanitizeText(row[1] || ""),
          hearing_type: sanitizeText(row[2] || ""),
          hearing_judge: sanitizeText(row[3] || ""),
          court: sanitizeText(row[4] || ""),
          court_room: sanitizeText(row[5] || "")
        };
        
        if (isValidDate(hearing.hearing_date)) {
          hearings.push(hearing);
        } else {
          warnings.push(`Skipped hearing with invalid date: ${hearing.hearing_date}`);
        }
      } else if (row.length > 0) {
        warnings.push("Skipped incomplete hearing data");
      }
    }

    // Parse Motions with better validation
    const motions: ParsedCase["motions"] = [];
    const actionsRows = extractTableData(text, "REGISTER OF ACTIONS ACTIVITY");
    for (const row of actionsRows) {
      if (row.length >= 3) {
        const eventDate = sanitizeText(row[0] || "");
        const eventDescription = sanitizeText(row[1] || "");
        const eventResult = sanitizeText(row[2] || "");
        
        if (/motion/i.test(eventDescription)) {
          if (isValidDate(eventDate)) {
            motions.push({
              filing_date: eventDate,
              title: eventDescription,
              content: row.join(" "),
              status: eventResult
            });
          } else {
            warnings.push(`Skipped motion with invalid date: ${eventDate}`);
          }
        }
      }
    }

    const parsedCase: ParsedCase = {
      case_number,
      judge,
      filing_date,
      court,
      case_type,
      plaintiff,
      defendant,
      charges,
      hearings,
      motions
    };

    // Validate the parsed case
    const validation = validateParsedCase(parsedCase);
    if (!validation.isValid) {
      throw new Error("Invalid case file content: " + validation.errors.join(". "));
    }

    return { 
      success: true, 
      case: parsedCase,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error: unknown) {
    console.error("Error parsing case PDF", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
