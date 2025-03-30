import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export interface MotionPdfData {
  caseNumber: string
  courtName: string
  judgeName?: string
  offenderName: string
  motionTitle: string
  motionContent: string
  filingDate: string
  attorneyName?: string
}

export async function generateMotionPdf(data: MotionPdfData): Promise<Uint8Array> {
  // Check if PDF generation is enabled
  if (!process.env.ENABLE_PDF_GENERATION) {
    throw new Error("PDF generation is disabled")
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()

  // Add a page to the document
  const page = pdfDoc.addPage([612, 792]) // Letter size: 8.5 x 11 inches

  // Get the standard fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Set some constants
  const margin = 72 // 1 inch margin
  const fontSize = 12
  const lineHeight = fontSize * 1.2
  const headerFontSize = 14
  const titleFontSize = 16

  // Current y position (start from top)
  let y = page.getHeight() - margin

  // Add court information
  page.drawText(data.courtName.toUpperCase(), {
    x: margin,
    y,
    size: headerFontSize,
    font: timesRomanBoldFont,
  })
  y -= lineHeight * 2

  // Add case information
  page.drawText(`CASE NO. ${data.caseNumber}`, {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanBoldFont,
  })
  y -= lineHeight * 2

  // Add offender information
  page.drawText(`STATE OF FLORIDA`, {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanFont,
  })
  y -= lineHeight

  page.drawText(`vs.`, {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanFont,
  })
  y -= lineHeight

  page.drawText(data.offenderName.toUpperCase(), {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanBoldFont,
  })
  y -= lineHeight * 3

  // Add motion title
  page.drawText(data.motionTitle.toUpperCase(), {
    x: page.getWidth() / 2,
    y,
    size: titleFontSize,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  })
  y -= lineHeight * 3

  // Add motion content
  const contentWidth = page.getWidth() - margin * 2
  const contentLines = splitTextIntoLines(data.motionContent, contentWidth, timesRomanFont, fontSize)

  for (const line of contentLines) {
    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font: timesRomanFont,
    })
    y -= lineHeight

    // Check if we need a new page
    if (y < margin) {
      const newPage = pdfDoc.addPage([612, 792])
      y = newPage.getHeight() - margin
    }
  }

  // Add filing date
  y -= lineHeight * 2
  page.drawText(`Respectfully submitted on ${data.filingDate}`, {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanFont,
  })

  // Add attorney information if provided
  if (data.attorneyName) {
    y -= lineHeight * 3
    page.drawText(data.attorneyName, {
      x: margin,
      y,
      size: fontSize,
      font: timesRomanBoldFont,
    })
    y -= lineHeight
    page.drawText("Attorney for Defendant", {
      x: margin,
      y,
      size: fontSize,
      font: timesRomanFont,
    })
  }

  // Serialize the PDF to bytes
  return await pdfDoc.save()
}

// Helper function to split text into lines that fit within a given width
function splitTextIntoLines(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

