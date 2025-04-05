import { query } from "./db/db"

export interface OffenderProfile {
  inmateNumber: string
  lastName: string
  firstName: string
  middleName?: string
  status: string
  facility?: string
  age?: number
  height?: string
  weight?: number
  eyeColor?: string
  hair?: string
  religion?: string
  education?: string
  complexion?: string
  ethnicity?: string
  pastOffenses: Array<{
    description: string
    caseNumber?: string
    status?: string
  }>
}

export async function parseOffenderProfile(
  text: string,
): Promise<{ success: boolean; offenderId?: number; error?: unknown }> {
  try {
    // This is a simplified parser for demonstration purposes

    // Extract inmate number
    const inmateNumberMatch = text.match(/Offender ID:\s*(\d+)/)
    const inmateNumber = inmateNumberMatch ? inmateNumberMatch[1].trim() : ""

    // Extract name
    const lastNameMatch = text.match(/Last Name:\s*([^\n]+)/)
    const lastName = lastNameMatch ? lastNameMatch[1].trim() : ""

    const firstNameMatch = text.match(/First Name:\s*([^\n]+)/)
    const firstName = firstNameMatch ? firstNameMatch[1].trim() : ""

    const middleNameMatch = text.match(/Middle Name:\s*([^\n]+)/)
    const middleName = middleNameMatch ? middleNameMatch[1].trim() : ""

    // Extract status
    const statusMatch = text.match(/Offender Status:\s*([^\n]+)/)
    const status = statusMatch ? statusMatch[1].trim() : ""

    // Extract facility
    const facilityMatch = text.match(/Facility\/Region:\s*([^\n]+)/)
    const facility = facilityMatch ? facilityMatch[1].trim() : ""

    // Extract demographics
    const ageMatch = text.match(/Age:\s*(\d+)/)
    const age = ageMatch ? Number.parseInt(ageMatch[1].trim()) : null

    const heightMatch = text.match(/Height:\s*([^\n]+)/)
    const height = heightMatch ? heightMatch[1].trim() : ""

    const weightMatch = text.match(/Weight:\s*(\d+)/)
    const weight = weightMatch ? Number.parseInt(weightMatch[1].trim()) : null

    const eyeColorMatch = text.match(/Eye Color:\s*([^\n]+)/)
    const eyeColor = eyeColorMatch ? eyeColorMatch[1].trim() : ""

    const hairMatch = text.match(/Hair:\s*([^\n]+)/)
    const hair = hairMatch ? hairMatch[1].trim() : ""

    const ethnicityMatch = text.match(/Ethnicity:\s*([^\n]+)/)
    const ethnicity = ethnicityMatch ? ethnicityMatch[1].trim() : ""

    // Check if offender already exists
    const existingOffender = await query("SELECT id FROM offenders WHERE inmate_number = $1", [inmateNumber])

    let offenderId: number | undefined

    if (existingOffender && existingOffender.rowCount !== null && existingOffender.rowCount > 0) {
      // Update existing offender
      offenderId = Number(existingOffender.rows[0].id)

      await query(
        `UPDATE offenders SET 
          last_name = $1, first_name = $2, middle_name = $3, status = $4, 
          facility = $5, age = $6, height = $7, weight = $8, 
          eye_color = $9, hair = $10, ethnicity = $11, updated_at = NOW()
        WHERE id = $12`,
        [lastName, firstName, middleName, status, facility, age, height, weight, eyeColor, hair, ethnicity, offenderId],
      )
    } else {
      // Create new offender
      const result = await query(
        `INSERT INTO offenders (
          inmate_number, last_name, first_name, middle_name, status, 
          facility, age, height, weight, eye_color, hair, ethnicity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          inmateNumber,
          lastName,
          firstName,
          middleName,
          status,
          facility,
          age,
          height,
          weight,
          eyeColor,
          hair,
          ethnicity,
        ],
      )

      offenderId = result.rows[0].id

      // Create user for the offender
      await query(
        `INSERT INTO users (username, password_hash, role, offender_id)
        VALUES ($1, $2, $3, $4)`,
        [inmateNumber, "$2b$10$X7VYVy1GUERl.Uo/5z.YUOtZY0r5gZ5VnhWK5/5.I5jWXSEFyimYO", "offender", offenderId],
      )
    }

    // Extract past offenses
    const pastOffensesSection = text.match(/Past Offense$$s$$([\s\S]*?)$/)
    if (pastOffensesSection) {
      const pastOffensesText = pastOffensesSection[1]
      const offenseLines = pastOffensesText.split("\n").filter((line) => line.includes("[") && line.includes("]"))

      // Clear existing past offenses
      await query("DELETE FROM past_offenses WHERE offender_id = $1", [offenderId])

      for (const line of offenseLines) {
        const descriptionMatch = line.match(/^([^[]+)/)
        const description = descriptionMatch ? descriptionMatch[1].trim() : ""

        const caseNumberMatch = line.match(/\[(.*?)\]/)
        const caseNumber = caseNumberMatch ? caseNumberMatch[1].trim() : ""

        const statusMatch = line.match(/\]\s*([^\n]+)/)
        const status = statusMatch ? statusMatch[1].trim() : ""

        await query(
          `INSERT INTO past_offenses (offender_id, offense_description, case_number, status)
          VALUES ($1, $2, $3, $4)`,
          [offenderId, description, caseNumber, status],
        )
      }
    }

    return { success: true, offenderId }
  } catch (error) {
    console.error("Error parsing offender profile", error)
    return { success: false, error }
  }
}

