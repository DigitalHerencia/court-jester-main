---
id: 99sct4rtl0zv3dpf78l9j0w
title: Overview
desc: ''
updated: 1743313527591
created: 1743311600918
---
# Court⚖️Jester Design | System

## Overview

---

This comprehensive set of files and configurations will allow you to implement the Court Jester design system in any Next.js 15 TypeScript 5 project with shadcn/ui 2. The design system features a beige/cream background with dark brown/black text and UI elements, providing a consistent and visually appealing user interface.

## Configuration

---

Here are the essential files to implement the Court Jester design system in any Next.js 15 TypeScript 5 project with shadcn/ui 2:

### 1. tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(36, 33%, 90%)",
        input: "hsl(36, 33%, 90%)",
        ring: "hsl(36, 33%, 90%)",
        background: "hsl(36, 33%, 85%)",
        foreground: "hsl(36, 10%, 15%)",
        primary: {
          DEFAULT: "hsl(36, 10%, 15%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        secondary: {
          DEFAULT: "hsl(25, 29%, 28%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 65%, 40%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        muted: {
          DEFAULT: "hsl(36, 10%, 20%)",
          foreground: "hsl(36, 33%, 70%)",
        },
        accent: {
          DEFAULT: "hsl(36, 33%, 75%)",
          foreground: "hsl(36, 10%, 15%)",
        },
        popover: {
          DEFAULT: "hsl(36, 33%, 85%)",
          foreground: "hsl(36, 10%, 15%)",
        },
        card: {
          DEFAULT: "hsl(36, 33%, 85%)",
          foreground: "hsl(36, 10%, 15%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        kings: ["Kings", "serif"],
        jacquard: ['"Jacquard 24 Charted"', "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
```

### 2. globals.css

```css
@tailwind base;
@tailwind components;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 36 33% 85%;
    --foreground: 36 10% 15%;
    
    --card: 36 33% 85%;
    --card-foreground: 36 10% 15%;
    
    --popover: 36 33% 85%;
    --popover-foreground: 36 10% 15%;
    
    --primary: 36 10% 15%;
    --primary-foreground: 36 33% 85%;
    
    --secondary: 25 29% 28%;
    --secondary-foreground: 36 33% 85%;
    
    --muted: 36 10% 20%;
    --muted-foreground: 36 33% 70%;
    
    --accent: 36 33% 75%;
    --accent-foreground: 36 10% 15%;
    
    --destructive: 0 65% 40%;
    --destructive-foreground: 36 33% 85%;
    
    --border: 36 33% 90%;
    --input: 36 33% 90%;
    --ring: 36 33% 90%;
    
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 36 10% 15%;
    --foreground: 36 33% 85%;
    
    --card: 36 10% 15%;
    --card-foreground: 36 33% 85%;
    
    --popover: 36 10% 15%;
    --popover-foreground: 36 33% 85%;
    
    --primary: 36 33% 85%;
    --primary-foreground: 36 10% 15%;
    
    --secondary: 25 29% 28%;
    --secondary-foreground: 36 33% 85%;
    
    --muted: 36 33% 70%;
    --muted-foreground: 36 10% 20%;
    
    --accent: 36 10% 20%;
    --accent-foreground: 36 33% 85%;
    
    --destructive: 0 65% 40%;
    --destructive-foreground: 36 33% 85%;
    
    --border: 36 10% 20%;
    --input: 36 10% 20%;
    --ring: 36 33% 85%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Custom Court Jester Styles */
body {
  height: 100vh;
  overflow-x: hidden;
}

.font-jacquard {
  font-family: "Jacquard 24 Charted", serif;
  font-weight: 400;
  font-style: normal;
}

.font-kings {
  font-family: "Kings", serif;
  font-weight: 400;
  font-style: normal;
}

.page-transition {
  transition: opacity 0.5s ease-in-out;
}

.scrollable-area {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--foreground)) hsl(var(--background));
}

.scrollable-area::-webkit-scrollbar {
  width: 8px;
}

.scrollable-area::-webkit-scrollbar-track {
  background: hsl(var(--background));
}

.scrollable-area::-webkit-scrollbar-thumb {
  background-color: hsl(var(--foreground));
  border-radius: 4px;
  border: 2px solid hsl(var(--background));
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Card Styles */
.card-primary {
  @apply rounded-md border border-primary/20 p-4 bg-primary text-primary-foreground;
}

.card-secondary {
  @apply rounded-md border border-primary p-4 bg-foreground text-background;
}

.card-content {
  @apply rounded-md border border-background/20 p-4 bg-background text-foreground;
}

/* Button Link Styles */
.button-link {
  @apply rounded-md border border-primary p-4 bg-background text-foreground hover:bg-background/90 transition-colors;
}

/* Settings Control Styles */
.settings-control {
  @apply flex justify-between items-center rounded-md border border-primary p-4 bg-background text-foreground;
}

/* Notification Styles */
.notification-item {
  @apply rounded-md border border-primary p-4 bg-background text-foreground;
}
```

### 3. lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4. components/ui/button.tsx

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/80 border border-transparent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-foreground/20 bg-background text-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "bg-transparent text-foreground hover:bg-foreground/10",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 5. Font Configuration (app/fonts.ts)

```typescript
import { Jacquard_24_Charted, Kings } from 'next/font/google'

export const jacquard = Jacquard_24_Charted({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jacquard",
  display: "swap",
})

export const kings = Kings({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kings",
  display: "swap",
})
```

### 6. Root Layout (app/layout.tsx)

```typescript
import type React from "react"
import type { Metadata } from "next"
import { jacquard, kings } from "@/app/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Court Jester",
  description: "Tu camarada en la sombra",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jacquard.variable} ${kings.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jacquard+24+Charted&family=Kings&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 fontSize=%2290%22>♠️</text></svg>"
        />
      </head>
      <body className="font-kings">{children}</body>
    </html>
  )
}
```

---

#### Screenshot 1
![alt text](design-system_screen-shot-1.jpeg)

---

#### Screenshot 2
![alt text](design-system_screen-shot-2.jpeg)

---

#### Screenshot 3
![alt text](design-system_screen-shot-3.jpeg)

---

#### Screenshot 4
![alt text](design-system_screen-shot-4.jpeg)

---

#### Screenshot 5
![alt text](design-system_screen-shot-5.jpeg)

---

## Installation Instructions

1. **Install required dependencies:**


```shellscript
npm install clsx tailwind-merge class-variance-authority @radix-ui/react-slot tailwindcss-animate @tailwindcss/typography
```

2. **Install shadcn/ui components:**


```shellscript
npx shadcn@latest init
```

3. **Copy the configuration files to your project:**

- Place `tailwind.config.ts` in the root directory
- Place `globals.css` in the app directory
- Place `utils.ts` in the lib directory
- Place `button.tsx` in the components/ui directory
- Place `fonts.ts` in the app directory
- Update your `layout.tsx` to include the font configuration

4. **Add Google Fonts:**

- Make sure to add the Jacquard 24 Charted and Kings fonts to your project
- You can use the Google Fonts API as shown in the layout.tsx file

## 8. Usage Examples

---

### Primary Card

```tsx
<div className="card-primary">
  <h2 className="font-kings mb-4 text-xl">Card Title</h2>
  <p className="mb-4">This is a primary card with a dark background and light text.</p>
  <Button>Action Button</Button>
</div>
```

### Secondary Card with Content

```tsx
<div className="card-secondary">
  <h2 className="font-kings mb-4 text-xl">Card Title</h2>
  <div className="card-content">
    <p>This is a nested content area within a secondary card.</p>
  </div>
  <Button variant="outline">Secondary Action</Button>
</div>
```

### Settings Control

```tsx
<div className="settings-control">
  <div>
    <h3 className="font-medium">Automatic Notifications</h3>
    <p className="text-sm mt-1">Enable automatic notifications for new case events</p>
  </div>
  <Button>Activate</Button>
</div>
```

### Notification Item

```tsx
<div className="notification-item">
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-medium">New Offender Registration</h3>
      <p className="mt-1">New offender with inmate number 468079 has been registered.</p>
      <p className="text-sm text-foreground/70 mt-2">3/22/2025 at 11:54:49 AM</p>
    </div>
    <Button variant="outline">Mark as Read</Button>
  </div>
</div>
```
---

## Design System Code

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="font-jacquard text-4xl">Court Jester</h1>
            <Link href="/" className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 h-[calc(100vh-200px)] overflow-y-auto pr-4 hide-scrollbar">
        <div className="mb-12 text-center">
          <h1 className="font-jacquard text-5xl mb-4">Design System</h1>
          <p className="text-xl font-kings max-w-2xl mx-auto">
            A comprehensive showcase of Court Jester's design elements, components, and styling patterns.
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-md overflow-hidden border border-foreground/20">
              <div className="h-32 bg-background border border-foreground"></div>
              <div className="p-4">
                <h3 className="font-kings text-xl mb-2">Background</h3>
                <p className="font-mono text-sm">#e8ddca</p>
                <p className="text-sm mt-2">Primary background color used throughout the application.</p>
              </div>
            </div>

            <div className="rounded-md overflow-hidden border border-foreground/20">
              <div className="h-32 bg-foreground border border-foreground"></div>
              <div className="p-4">
                <h3 className="font-kings text-xl mb-2">Foreground</h3>
                <p className="font-mono text-sm">#292520</p>
                <p className="text-sm mt-2">Primary text color and button background.</p>
              </div>
            </div>

            <div className="rounded-md overflow-hidden border border-foreground/20">
              <div className="h-32 bg-primary border border-foreground"></div>
              <div className="p-4">
                <h3 className="font-kings text-xl mb-2">Primary</h3>
                <p className="font-mono text-sm">#5c4032</p>
                <p className="text-sm mt-2">Used for primary elements and accents.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Typography</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-kings text-xl mb-2">Jacquard 24 Charted (Display)</h3>
              <div className="space-y-2">
                <p className="font-jacquard text-5xl">Display (5xl)</p>
                <p className="font-jacquard text-4xl">Heading 1 (4xl)</p>
                <p className="font-jacquard text-3xl">Heading 2 (3xl)</p>
                <p className="font-jacquard text-2xl">Heading 3 (2xl)</p>
                <p className="font-jacquard text-xl">Heading 4 (xl)</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-kings text-xl mb-2">Kings (Body)</h3>
              <div className="space-y-2">
                <p className="font-kings text-2xl">Large Text (2xl)</p>
                <p className="font-kings text-xl">Medium Text (xl)</p>
                <p className="font-kings text-base">Regular Text (base)</p>
                <p className="font-kings text-sm">Small Text (sm)</p>
                <p className="font-kings text-xs">Extra Small (xs)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Buttons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-kings text-xl mb-2">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-foreground text-background hover:bg-foreground/90">Default Button</Button>
                <Button className="bg-foreground text-background hover:bg-foreground/90" disabled>
                  Disabled
                </Button>
                <Button className="bg-foreground text-background hover:bg-foreground/90 h-8 text-sm px-3">Small</Button>
                <Button className="bg-foreground text-background hover:bg-foreground/90 h-12 text-lg px-6">
                  Large
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-kings text-xl mb-2">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="border-foreground/20 hover:bg-background hover:text-foreground">
                  Outline
                </Button>
                <Button
                  variant="outline"
                  className="border-foreground/20 hover:bg-background hover:text-foreground"
                  disabled
                >
                  Disabled
                </Button>
                <Button className="bg-primary text-background hover:bg-primary/90">Accent</Button>
                <Button className="bg-background text-foreground hover:bg-background/90 border border-foreground/20">
                  Inverse
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Form Elements</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-kings text-xl mb-4">Text Inputs</h3>
              <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
                <h4 className="font-kings mb-4 text-xl">Input Controls</h4>
                <div className="space-y-4">
                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                    <label className="block mb-2 font-kings">Default Input</label>
                    <Input
                      placeholder="Enter text here..."
                      className="border-foreground/20 bg-background text-foreground placeholder:text-foreground/70"
                    />
                  </div>
                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                    <label className="block mb-2 font-kings">Disabled Input</label>
                    <Input
                      placeholder="Disabled input"
                      disabled
                      className="border-foreground/20 bg-background text-foreground placeholder:text-foreground/70"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-kings text-xl mb-4">Select & Textarea</h3>
              <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
                <h4 className="font-kings mb-4 text-xl">Advanced Controls</h4>
                <div className="space-y-4">
                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                    <label className="block mb-2 font-kings">Select Input</label>
                    <select className="w-full p-3 border border-foreground/20 bg-background text-foreground font-kings rounded-md">
                      <option value="">Select an option...</option>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                    </select>
                  </div>
                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                    <label className="block mb-2 font-kings">Textarea</label>
                    <textarea
                      placeholder="Enter longer text here..."
                      className="w-full p-3 border border-foreground/20 bg-background text-foreground font-kings rounded-md min-h-[100px]"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Cards & Containers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-kings text-xl mb-4">Primary Card</h3>
              <div className="rounded-md border border-background/20 p-4 bg-primary text-background">
                <h4 className="font-kings mb-4 text-xl">Card Title</h4>
                <p className="mb-4">
                  This is a primary card with a dark background and light text. It's commonly used for important
                  sections.
                </p>
                <Button className="bg-background text-foreground hover:bg-background/90">Action Button</Button>
              </div>
            </div>

            <div>
              <h3 className="font-kings text-xl mb-4">Secondary Card</h3>
              <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
                <h4 className="font-kings mb-4 text-xl">Card Title</h4>
                <div className="rounded-md border border-background/20 p-4 bg-background text-foreground mb-4">
                  <p>This is a nested content area within a secondary card.</p>
                </div>
                <Button variant="outline" className="border-background/20 hover:bg-foreground hover:text-background">
                  Secondary Action
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Notifications</h2>

          <div className="rounded-md border border-primary p-4 bg-foreground text-background">
            <h4 className="font-kings mb-4 text-xl">Recent Notifications</h4>
            <div className="space-y-4">
              <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">New Offender Registration</h3>
                    <p className="mt-1">New offender with inmate number 468079 has been registered.</p>
                    <p className="text-sm text-foreground/70 mt-2">3/22/2025 at 11:54:49 AM</p>
                  </div>
                  <Button variant="outline" className="border-foreground/20 hover:bg-background hover:text-foreground">
                    Mark as Read
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Hearing Scheduled</h3>
                    <p className="mt-1">A hearing has been scheduled for case M-14-VM-20240546.</p>
                    <p className="text-sm text-foreground/70 mt-2">3/21/2025 at 11:54:49 AM</p>
                  </div>
                  <Button variant="outline" className="border-foreground/20 hover:bg-background hover:text-foreground">
                    Mark as Read
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offender Cards */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Offender Cards</h2>

          <div className="rounded-md border border-primary p-4 bg-foreground text-background">
            <h4 className="font-kings mb-4 text-xl">Offender Information</h4>
            <div className="space-y-4">
              <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="font-medium text-lg">Christopher Dominguez</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Number:</span> 468079
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> In Custody
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Facility:</span> Las Cruces Magistrate
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Registered:</span> 3/22/2025
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button className="bg-foreground text-background hover:bg-foreground/90">View Details</Button>
                    <Button
                      variant="outline"
                      className="border-background/20 hover:bg-foreground hover:text-background"
                    >
                      Notify Profile Ready
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Navigation</h2>

          <div className="space-y-8">
            <div>
              <h3 className="font-kings text-xl mb-4">Tab Navigation</h3>
              <nav className="mb-8 overflow-x-auto">
                <div className="flex w-full rounded-md border border-foreground">
                  {[
                    { label: "Notifications", count: 3, active: true },
                    { label: "Offenders", active: false },
                    { label: "Admin", active: false },
                    { label: "Settings", active: false },
                  ].map((tab, index) => (
                    <div
                      key={index}
                      className={`relative flex-1 px-4 py-2 text-center transition-colors ${
                        tab.active
                          ? "font-medium bg-background text-foreground"
                          : "bg-foreground text-background hover:bg-foreground/90"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count && (
                        <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
                          {tab.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            </div>

            <div>
              <h3 className="font-kings text-xl mb-4">Button Links</h3>
              <div className="rounded-md border border-primary p-4 bg-foreground text-background">
                <h4 className="font-kings mb-4 text-xl">Navigation Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground hover:bg-background/90">
                    <h3 className="font-medium text-lg">Admin Tools</h3>
                    <p className="mt-1">Manage offenders, cases, and system settings</p>
                  </div>

                  <div className="rounded-md border border-background/20 p-4 bg-background text-foreground hover:bg-background/90">
                    <h3 className="font-medium text-lg">Offenders</h3>
                    <p className="mt-1">View and manage offender records</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Controls */}
        <section className="mb-16">
          <h2 className="font-jacquard text-3xl mb-6 pb-2 border-b border-foreground/20">Settings Controls</h2>

          <div className="rounded-md border border-primary p-4 bg-foreground text-background">
            <h4 className="font-kings mb-4 text-xl">System Configuration</h4>
            <div className="space-y-4">
              <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Automatic Notifications</h3>
                    <p className="text-sm mt-1">Enable automatic notifications for new case events</p>
                  </div>
                  <Button className="bg-foreground text-background hover:bg-foreground/90">Activate</Button>
                </div>
              </div>

              <div className="rounded-md border border-background/20 p-4 bg-background text-foreground">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Automatic Motion Generation</h3>
                    <p className="text-sm mt-1">Enable AI-assisted motion generation</p>
                  </div>
                  <Button className="bg-foreground text-background hover:bg-foreground/90">Activate</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="font-jacquard text-2xl mb-2">Court Jester</h2>
              <p className="font-kings">Tu camarada en la sombra</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm">Versión 3.0 • "La Pinta Edition" • Sin vigilancia</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

```
