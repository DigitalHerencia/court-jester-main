"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username.trim()) {
      setError("Por favor ingrese un número de preso");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: username }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!response.ok) {
        const errorMessage = data.error || "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        const { role, newUser, offenderId } = data;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "offender") {
          router.push(newUser ? "/confirmation" : `/offender/dashboard/${offenderId}`);
        }
      } else {
        setError("Unknown error occurred");
        toast.error("Unknown error occurred");
        setIsLoading(false);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-6xl font-jacquard mb-2">Court Jester</h1>
        <p className="text-2xl mb-8 italic font-kings">Tu camarada en la sombra</p>

        <div className="relative w-full h-full mb-8 flex justify-center">
          <Image
            priority
            alt="Court Jester"
            height={220}
            src="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/joker-playing-card_u-l-q1llfru0-osUnpoXVjFN6NKKiez5weQaczsIMdU.jpeg"
            width={150}
          />
        </div>

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              className="w-full p-3 border border-foreground bg-background text-foreground text-center font-kings"
              disabled={isLoading}
              placeholder="Número de preso"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {error && <div className="mb-4 text-red-500 text-center font-kings">{error}</div>}

          <Button
            className="w-full p-3 font-bold uppercase font-kings"
            disabled={isLoading}
            type="submit"
            variant="default"
          >
            {isLoading ? "Procesando..." : "BUSCAR"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-center font-kings">Versión 3.0 • &quot;La Pinta Edition&quot; • Sin Vigilancia</p>
      </div>
    </div>
  )
}

