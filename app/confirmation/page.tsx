"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ConfirmationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleReturn = () => {
    setIsSubmitting(true)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-6xl font-jacquard mb-2">Court Jester</h1>
        <p className="text-2xl mb-8 italic font-kings">Tu camarada en la sombra</p>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center">Registration Received</CardTitle>
            <CardDescription className="text-center">Your account is being processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="relative w-full h-32 flex justify-center">
              <Image
                priority
                alt="Court Jester"
                height={150}
                src="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/joker-playing-card_u-l-q1llfru0-osUnpoXVjFN6NKKiez5weQaczsIMdU.jpeg"
                width={100}
              />
            </div>
            <p className="text-foreground">
              Thank you for registering with Court Jester. Your account is being processed and will be available within
              24 hours.
            </p>
            <p className="text-foreground">
              Please check back later using your inmate number to access your dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full p-3 bg-foreground text-background font-bold uppercase font-kings"
              disabled={isSubmitting}
              onClick={handleReturn}
            >
              {isSubmitting ? "REGRESANDO..." : "REGRESAR"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
