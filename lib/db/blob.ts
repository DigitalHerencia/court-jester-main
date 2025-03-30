// lib/blob.ts
import { put } from "@vercel/blob"

/**
 * Uploads a mugshot file to Vercel Blob storage.
 *
 * This function validates that the necessary environment variables are set,
 * performs the upload using the official Vercel Blob API, and returns the URL of the uploaded file.
 *
 * @param fileBuffer - The file data as a Buffer.
 * @param filename - The desired filename for storage.
 * @param contentType - The MIME type of the file.
 * @returns A Promise that resolves to the URL of the uploaded file.
 * @throws An error if the upload fails.
 */
export async function uploadMugshot(fileBuffer: Buffer, filename: string, contentType: string): Promise<string> {
  // Validate required environment variables.
  if (!process.env.JOKER_MUGSHOT_ENDPOINT) {
    throw new Error("Blob endpoint is not configured")
  }
  if (!process.env.JOKER_READ_WRITE_TOKEN) {
    throw new Error("Blob API key is not configured")
  }

  try {
    // Construct the storage key (e.g., store in the "court-jester" folder).
    const key = `court-jester/${filename}`
    // Use the put function from @vercel/blob.
    // Pass only supported options (e.g., contentType and access).
    const blob = await put(key, fileBuffer, {
      contentType,
      access: "public",
    })
    if (!blob || !blob.url) {
      throw new Error("Blob upload failed, missing URL in response")
    }
    return blob.url
  } catch (error: any) {
    console.error("Error uploading mugshot:", error)
    throw new Error(`Failed to upload mugshot: ${error.message}`)
  }
}

