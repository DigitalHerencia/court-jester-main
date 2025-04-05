// pdf-parser.ts

// Polyfill for DOMMatrix in Node.js environments
if (typeof DOMMatrix === "undefined") {
  class CustomDOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    is2D = true;
    isIdentity = true;

    constructor(_init?: string | number[]) {
      // Minimal implementation for pdf-parse usage
    }

    invertSelf() { return this; }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    rotateAxisAngleSelf() { return this; }
    rotateFromVectorSelf() { return this; }
    rotateSelf() { return this; }
    scale3dSelf() { return this; }
    scaleSelf() { return this; }
    setMatrixValue() { return this; }
    skewXSelf() { return this; }
    skewYSelf() { return this; }
    translateSelf() { return this; }
    
    multiply() { return new CustomDOMMatrix(); }
    flipX() { return new CustomDOMMatrix(); }
    flipY() { return new CustomDOMMatrix(); }
    inverse() { return new CustomDOMMatrix(); }
    rotate() { return new CustomDOMMatrix(); }
    rotateAxisAngle() { return new CustomDOMMatrix(); }
    scale() { return new CustomDOMMatrix(); }
    scaleNonUniform() { return new CustomDOMMatrix(); }
    skewX() { return new CustomDOMMatrix(); }
    skewY() { return new CustomDOMMatrix(); }

    static fromFloat32Array(_array32: Float32Array) {
      return new CustomDOMMatrix();
    }
    static fromFloat64Array(_array64: Float64Array) {
      return new CustomDOMMatrix();
    }
    static fromMatrix(_other?: unknown) {
      return new CustomDOMMatrix();
    }

    rotateFromVector() { return new CustomDOMMatrix(); }
    scale3d() { return new CustomDOMMatrix(); }
    toFloat32Array() { return new Float32Array(); }
    toFloat64Array() { return new Float64Array(); }
    toString() { return ''; }
    transformPoint() { return new DOMPoint(); }
    toJSON() { return {}; }
  }

  // @ts-expect-error: CustomDOMMatrix is not a standard global object
  globalThis.DOMMatrix = CustomDOMMatrix;
}

import pdf from "pdf-parse";

// Define the interface matching our Neon DB schema for parsed case data.
export interface ParsedCase {
  case_number: string;
  judge: string;
  filing_date: string;
  court: string;
  case_type: string;
  plaintiff: string;
  defendant: string;
  charges: Array<{
    count_number: number;
    statute: string;
    description: string;
    class: string;
    charge_date: string;
    citation_number: string;
    plea: string;
    disposition: string;
    disposition_date: string;
  }>;
  hearings: Array<{
    hearing_date: string;
    hearing_time: string;
    hearing_type: string;
    hearing_judge: string;
    court: string;
    court_room: string;
  }>;
  motions: Array<{
    filing_date: string;
    title: string;
    content: string;
    status: string;
  }>;
}

/**
 * Extracts text from a PDF file using pdf-parse.
 *
 * @param data An ArrayBuffer containing the PDF file.
 * @returns The extracted text.
 */
async function extractTextFromPDF(data: ArrayBuffer): Promise<string> {
  // Convert ArrayBuffer to Node.js Buffer.
  const buffer = Buffer.from(data);
  const result = await pdf(buffer);
  return result.text;
}

/**
 * Helper function to extract table data for a given section header.
 * It locates the section header (without a trailing colon), skips two header lines,
 * and returns a 2D array where each row is an array of cell values (split by two-or-more spaces).
 *
 * @param text The full extracted text from the PDF.
 * @param sectionHeader The section heading (e.g. "CASE DETAIL").
 * @param numHeaderLines Number of header lines to skip (default: 2).
 * @returns A two-dimensional array of strings.
 */
function extractTableData(text: string, sectionHeader: string, numHeaderLines = 2): string[][] {
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
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const dataLines = lines.slice(numHeaderLines);
  return dataLines.map((line) => line.split(/\s{2,}/));
}

/**
 * Parses a case PDF by extracting its text with pdf-parse, then processing
 * various sections to build a ParsedCase object.
 *
 * @param pdfData An ArrayBuffer containing the PDF file.
 * @param _offenderId Offender ID (unused; underscore prefix to satisfy ESLint).
 * @returns An object indicating success and containing parsed case data.
 */
export async function parseCasePdf(
  pdfData: ArrayBuffer,
  _offenderId: number
): Promise<{
  warnings: any; success: boolean; case?: ParsedCase; error?: string 
}> {
  try {
    // Extract text from the PDF using pdf-parse.
    const text = await extractTextFromPDF(pdfData);

    // 1. Parse Case Detail (expects: CASE # | CURRENT JUDGE | FILING DATE | COURT)
    const caseDetailRows = extractTableData(text, "CASE DETAIL");
    if (caseDetailRows.length === 0 || caseDetailRows[0].length < 4) {
      throw new Error("Failed to extract case details from PDF");
    }
    const [caseNumRaw, judgeRaw, filingDateRaw, courtRaw] = caseDetailRows[0];
    const case_number = caseNumRaw || "";
    const judge = judgeRaw || "";
    const filing_date = filingDateRaw || "";
    const court = courtRaw || "";
    const case_type = case_number.includes("-CV-") ? "Civil" : "Criminal";

    // 2. Parse Parties (expects: PARTY TYPE | PARTY DESCRIPTION | PARTY # | PARTY NAME)
    const partiesRows = extractTableData(text, "PARTIES TO THIS CASE");
    let plaintiff = "";
    let defendant = "";
    for (const row of partiesRows) {
      if (row.length >= 4) {
        const partyType = row[0].toUpperCase();
        const partyName = row[3] || "";
        if (partyType.startsWith("P")) {
          plaintiff = partyName;
        } else if (partyType.startsWith("D")) {
          defendant = partyName;
        }
      }
    }

    // 3. Parse Charges (from CRIMINAL CHARGE DETAIL)
    const charges: ParsedCase["charges"] = [];
    const chargesRows = extractTableData(text, "CRIMINAL CHARGE DETAIL");
    // Expected columns: PARTY | COUNT | SEQ # | STATUTE | CHARGE | CLASS | CHARGE DATE | CIT # | PLEA | DISPOSITION | DISP DATE
    let count_number = 1;
    for (const row of chargesRows) {
      if (row.length >= 11) {
        charges.push({
          count_number,
          statute: row[3] || "",
          description: row[4] || "",
          class: row[5] || "",
          charge_date: row[6] || "",
          citation_number: row[7] || "",
          plea: row[8] || "",
          disposition: row[9] || "",
          disposition_date: row[10] || ""
        });
        count_number++;
      }
    }

    // 4. Parse Hearings (from HEARINGS FOR THIS CASE)
    const hearings: ParsedCase["hearings"] = [];
    const hearingsRows = extractTableData(text, "HEARINGS FOR THIS CASE");
    // Expected columns: HEARING DATE | HEARING TIME | HEARING TYPE | HEARING JUDGE | COURT | COURT ROOM
    for (const row of hearingsRows) {
      if (row.length >= 6) {
        hearings.push({
          hearing_date: row[0] || "",
          hearing_time: row[1] || "",
          hearing_type: row[2] || "",
          hearing_judge: row[3] || "",
          court: row[4] || "",
          court_room: row[5] || ""
        });
      }
    }

    // 5. Parse Motions (from REGISTER OF ACTIONS ACTIVITY)
    const motions: ParsedCase["motions"] = [];
    const actionsRows = extractTableData(text, "REGISTER OF ACTIONS ACTIVITY");
    // Expected columns: EVENT DATE | EVENT DESCRIPTION | EVENT RESULT | PARTY TYPE | PARTY # | AMOUNT
    // Only keep rows where EVENT DESCRIPTION contains "motion" (case-insensitive)
    for (const row of actionsRows) {
      if (row.length >= 3) {
        const eventDate = row[0] || "";
        const eventDescription = row[1] || "";
        const eventResult = row[2] || "";
        if (/motion/i.test(eventDescription)) {
          motions.push({
            filing_date: eventDate,
            title: eventDescription,
            content: row.join(" "),
            status: eventResult
          });
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

    return { success: true, case: parsedCase, warnings: null };
  } catch (error: unknown) {
    console.error("Error parsing case PDF", error);
    return { success: false, warnings: null, error: error instanceof Error ? error.message : String(error) };
  }
}
