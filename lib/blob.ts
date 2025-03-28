import { put } from "@vercel/blob"

export async function uploadMugshot(file: File, inmateNumber: string) {
  try {
    const filename = `${inmateNumber}-mugshot.jpg`
    const blob = await put(`court-jester/${filename}`, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading mugshot", error)
    throw error
  }
}

