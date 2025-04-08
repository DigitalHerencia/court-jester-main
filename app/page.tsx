// app/page.tsx

"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";

type FormData = {
  username: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    const username = data.username;
    if (!username.trim()) {
      // Show dismissible toast error instead of form error
      toast.error("Ingrese un número de preso válido", {
        dismissible: true, // Make toast dismissible
        duration: 5000, // 5 seconds duration
      });
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: username }),
      });
      const responseText = await response.text();
      const result = JSON.parse(responseText);
      if (!response.ok) {
        const errorMessage = result.error || "Login failed";
        toast.error(errorMessage, {
          dismissible: true,
          duration: 5000,
        });
        return;
      }
      if (result.success) {
        const { role, newUser, offenderId } = result;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "offender") {
          router.push(newUser ? "/confirmation" : `/offender/dashboard/${offenderId}`);
        }
      } else {
        toast.error("Unknown error occurred", {
          dismissible: true,
          duration: 5000,
        });
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred during login";
      toast.error(errorMessage, {
        dismissible: true,
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-6xl font-jacquard mb-2">Court Jester</h1>
        <p className="text-2xl mb-8 italic font-kings">Tu camarada en la sombra</p>

        <div className="relative mb-8 flex justify-center">
          <Image
            priority
            alt="Court Jester"
            height={220}
            src="https://a5fvmmg873kgkibm.public.blob.vercel-storage.com/court-jester/joker-playing-card_u-l-q1llfru0-osUnpoXVjFN6NKKiez5weQaczsIMdU.jpeg"
            width={150}
          />
        </div>

        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <input
              className="w-full p-3 border-2 rounded-md border-border bg-background text-foreground text-center font-kings"
              placeholder="Número de preso"
              type="text"
              {...register("username")}
            />
            {/* Removed the error message div that was here */}
          </div>

          <Button
            className="w-full p-4 bg-foreground text-background hover:bg-background hover:text-foreground"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Procesando..." : "BUSCAR"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-center font-kings">
          Versión 3.0 • &quot;La Pinta Edition&quot; • Sin Vigilancia
        </p>
      </div>
    </div>
  );
}