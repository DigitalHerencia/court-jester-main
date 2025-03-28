"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple login - direct redirect based on username
    if (username === "admin") {
      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard"
    } else if (username) {
      // Redirect to offender dashboard with the inmate number
      window.location.href = `/offender/dashboard/${username}`
    } else {
      toast.error("Invalid credentials")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-6xl font-jacquard mb-2">Court Jester</h1>
        <p className="text-2xl mb-8 italic font-kings">Tu camarada en la sombra</p>

        <div className="relative w-full mb-8 flex justify-center">
          <Image
            src="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/joker-playing-card_u-l-q1llfru0-osUnpoXVjFN6NKKiez5weQaczsIMdU.jpeg"
            alt="Court Jester"
            width={150}
            height={220}
            priority
            className="h-auto"
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Número de preso"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-foreground bg-background text-foreground text-center font-kings"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full p-3 bg-foreground text-background font-bold uppercase font-kings"
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "BUSCAR AHORA"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-center font-kings">Versión 3.0 • "La Pinta Edition" • Sin vigilancia</p>
      </div>
    </div>
  )
}

