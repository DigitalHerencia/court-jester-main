"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Motion {
  id: number
  title: string
  content: string
  offenderName: string
  judge?: string
  venue?: string
}

export default function MotionEditorPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [motion, setMotion] = useState<Motion | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMotion() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/motions/${id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch motion: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setMotion(data.motion)
        setTitle(data.motion.title)
        setContent(data.motion.content)
      } catch (err) {
        console.error("Error fetching motion:", err)
        setError(err instanceof Error ? err.message : "Failed to load motion")
        toast.error("Failed to load motion")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMotion()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/motions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
      if (!response.ok) {
        throw new Error(`Failed to update motion: ${response.status} ${response.statusText}`)
      }
      toast.success("Motion updated successfully")
      router.push("/admin/dashboard/motions")
    } catch (err) {
      console.error("Error updating motion:", err)
      setError(err instanceof Error ? err.message : "Failed to update motion")
      toast.error("Failed to update motion")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
        <p className="text-center py-4">Loading motion...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
        <p className="text-center py-4 text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-4 bg-primary text-background">
        <h2 className="font-kings text-xl mb-2">Edit Motion</h2>
        <p>Edit the motion details below. Motion template fields are auto-populated from the offender’s case and profile data.</p>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-2 font-kings">Motion Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-background/20 bg-background text-foreground font-kings"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-kings">Motion Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit motion content here..."
            className="w-full p-3 border border-background/20 bg-background text-foreground font-kings min-h-[200px]"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-center border-b border-background pb-2 font-kings">{error}</p>
        )}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-background/20 hover:bg-background hover:text-foreground bg-foreground text-background"
            onClick={() => router.push("/admin/dashboard/motions")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-background text-foreground hover:bg-background/90"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
