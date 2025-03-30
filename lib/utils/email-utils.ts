import { query } from "@/lib/db/db"

interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  from_email: string
  from_name: string
}

/**
 * Gets the email settings from the database
 * @returns Promise resolving to the email settings
 */
export async function getEmailSettings(): Promise<EmailSettings> {
  try {
    const result = await query(`
      SELECT 
        smtp_host, 
        smtp_port, 
        smtp_user, 
        smtp_password, 
        from_email, 
        from_name
      FROM email_settings
      LIMIT 1
    `)

    if (result.rowCount === 0) {
      throw new Error("Email settings not found")
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching email settings:", error)
    throw new Error("Failed to fetch email settings")
  }
}

/**
 * Sends an email
 * Note: This is a placeholder implementation. In a real application,
 * you would use a library like Nodemailer or an email service API.
 *
 * @param to Recipient email address
 * @param subject Email subject
 * @param html Email HTML content
 * @param text Plain text alternative
 * @returns Promise resolving to a success message
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<string> {
  // Check if email notifications are enabled
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") {
    throw new Error("Email notifications are not enabled")
  }

  try {
    // Get email settings
    const settings = await getEmailSettings()

    // In a real implementation, you would use Nodemailer or an email service API here
    // For this example, we'll just log the email details

    console.log("Sending email:")
    console.log(`From: ${settings.from_name} <${settings.from_email}>`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html.substring(0, 100)}...`)
    if (text) console.log(`Text: ${text.substring(0, 100)}...`)

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return "Email sent successfully"
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

/**
 * Sends a court date reminder email
 * @param to Recipient email address
 * @param offenderName Offender name
 * @param caseNumber Case number
 * @param courtDate Court date
 * @param location Court location
 * @returns Promise resolving to a success message
 */
export async function sendCourtDateReminderEmail(
  to: string,
  offenderName: string,
  caseNumber: string,
  courtDate: string,
  location: string,
): Promise<string> {
  const subject = `Court Date Reminder: ${new Date(courtDate).toLocaleDateString()}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Court Date Reminder</h2>
      <p>Hello ${offenderName},</p>
      <p>This is a reminder that you have an upcoming court appearance:</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #333;">
        <p><strong>Case Number:</strong> ${caseNumber}</p>
        <p><strong>Date:</strong> ${new Date(courtDate).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${location}</p>
      </div>
      <p>Please ensure you arrive at least 30 minutes before your scheduled appearance.</p>
      <p>Regards,<br>Court Jester System</p>
    </div>
  `

  const text = `
    Court Date Reminder
    
    Hello ${offenderName},
    
    This is a reminder that you have an upcoming court appearance:
    
    Case Number: ${caseNumber}
    Date: ${new Date(courtDate).toLocaleDateString()}
    Location: ${location}
    
    Please ensure you arrive at least 30 minutes before your scheduled appearance.
    
    Regards,
    Court Jester System
  `

  return sendEmail(to, subject, html, text)
}

/**
 * Sends a motion status update email
 * @param to Recipient email address
 * @param offenderName Offender name
 * @param motionTitle Motion title
 * @param status New motion status
 * @returns Promise resolving to a success message
 */
export async function sendMotionStatusEmail(
  to: string,
  offenderName: string,
  motionTitle: string,
  status: string,
): Promise<string> {
  const subject = `Motion Status Update: ${status}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Motion Status Update</h2>
      <p>Hello ${offenderName},</p>
      <p>The status of your motion has been updated:</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #333;">
        <p><strong>Motion:</strong> ${motionTitle}</p>
        <p><strong>New Status:</strong> ${status}</p>
      </div>
      <p>You can view the details in your Court Jester account.</p>
      <p>Regards,<br>Court Jester System</p>
    </div>
  `

  const text = `
    Motion Status Update
    
    Hello ${offenderName},
    
    The status of your motion has been updated:
    
    Motion: ${motionTitle}
    New Status: ${status}
    
    You can view the details in your Court Jester account.
    
    Regards,
    Court Jester System
  `

  return sendEmail(to, subject, html, text)
}

