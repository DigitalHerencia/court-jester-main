import { query } from "./db/db"

interface CaseData {
  caseNumber: string
  court: string
  judge: string
  filingDate: string
  charges: Array<{
    count: number
    statute: string
    description: string
    class: string
    chargeDate: string
    citation: string
    plea: string
    disposition: string
    dispositionDate: string
  }>
  hearings: Array<{
    date: string
    time: string
    type: string
    judge: string
    court: string
    courtRoom: string
  }>
}

export async function parseCasePdf(text: string, offenderId: number) {
  try {
    // This is a simplified parser for demonstration purposes
    // In a real application, you would use a more robust PDF parsing library

    // Extract case number
    const caseNumberMatch = text.match(/CASE #([^\n]+)/)
    const caseNumber = caseNumberMatch ? caseNumberMatch[1].trim() : ""

    // Extract judge
    const judgeMatch = text.match(/CURRENT JUDGE([^\n]+)/)
    const judge = judgeMatch ? judgeMatch[1].trim() : ""

    // Extract filing date
    const filingDateMatch = text.match(/FILING DATE([^\n]+)/)
    const filingDate = filingDateMatch ? filingDateMatch[1].trim() : ""

    // Extract court
    const courtMatch = text.match(/COURT\s*\n([^\n]+)/)
    const court = courtMatch ? courtMatch[1].trim() : ""

    // Create case in database
    const caseResult = await query(
      `INSERT INTO cases (case_number, court, judge, filing_date, offender_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [caseNumber, court, judge, filingDate ? new Date(filingDate) : null, offenderId],
    )

    const caseId = caseResult.rows[0].id

    // Extract charges (simplified)
    const chargesSection = text.match(/CRIMINAL CHARGE DETAIL([\s\S]*?)HEARINGS FOR THIS CASE/)
    if (chargesSection) {
      const chargesText = chargesSection[1]
      const chargeLines = chargesText.split("\n").filter((line) => line.includes("D  "))

      for (let i = 0; i < chargeLines.length; i++) {
        const line = chargeLines[i]
        const parts = line.split(/\s{2,}/)

        if (parts.length >= 8) {
          await query(
            `INSERT INTO charges (
              case_id, count_number, statute, description, class, 
              charge_date, citation_number, plea, disposition, disposition_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              caseId,
              i + 1,
              parts[2] || "",
              parts[3] || "",
              parts[4] || "",
              parts[5] ? new Date(parts[5]) : null,
              parts[6] || "",
              parts[7] || "",
              parts[8] || "",
              parts[9] ? new Date(parts[9]) : null,
            ],
          )
        }
      }
    }

    // Extract hearings (simplified)
    const hearingsSection = text.match(/HEARINGS FOR THIS CASE([\s\S]*?)REGISTER OF ACTIONS ACTIVITY/)
    if (hearingsSection) {
      const hearingsText = hearingsSection[1]
      const hearingLines = hearingsText.split("\n").filter((line) => /\d{2}\/\d{2}\/\d{4}/.test(line))

      for (const line of hearingLines) {
        const parts = line.split(/\s{2,}/)

        if (parts.length >= 6) {
          await query(
            `INSERT INTO hearings (
              case_id, hearing_date, hearing_time, hearing_type, 
              hearing_judge, court, court_room
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              caseId,
              parts[0] ? new Date(parts[0]) : null,
              parts[1] || "",
              parts[2] || "",
              parts[3] || "",
              parts[4] || "",
              parts[5] || "",
            ],
          )
        }
      }
    }

    return { success: true, caseId }
  } catch (error) {
    console.error("Error parsing case PDF", error)
    return { success: false, error }
  }
}

