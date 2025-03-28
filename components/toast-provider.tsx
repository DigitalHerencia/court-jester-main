"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#292520",
          color: "#e8ddca",
          border: "1px solid #e8ddca",
          fontFamily: "'Kings', serif",
        },
      }}
    />
  )
}

