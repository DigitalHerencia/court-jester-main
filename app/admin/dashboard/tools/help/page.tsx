"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HelpContentPage() {
  const [activeSection, setActiveSection] = useState<"offender" | "admin">("offender")
  const router = useRouter()

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
      <div className="rounded-md border border-background/20 p-2 bg-primary text-background">
        <h2 className="font-kings mb-2 text-xl">Help Content Management</h2>
        <p className="mb-2">
          View and manage the help content for the Court Jester application. This content is displayed to users when
          they access the help system.
        </p>

        <div className="flex gap-2 mb-4">
          <Button
            className={`${
              activeSection === "offender" ? "bg-background text-foreground" : "bg-foreground text-background"
            } hover:bg-background/90`}
            onClick={() => setActiveSection("offender")}
          >
            Offender Interface
          </Button>
          <Button
            className={`${
              activeSection === "admin" ? "bg-background text-foreground" : "bg-foreground text-background"
            } hover:bg-background/90`}
            onClick={() => setActiveSection("admin")}
          >
            Admin Interface
          </Button>
        </div>
      </div>

      {activeSection === "offender" && (
        <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
          <h2 className="font-kings mb-2 text-xl">Offender Interface (Available in Spanish and English)</h2>

          <div className="space-y-4">
            <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
              <h3 className="font-kings text-lg mb-2">Login Page</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>BUSCAR AHORA / SEARCH NOW Button</strong>: Submits the inmate number to authenticate and
                  access the system.
                </li>
                <li>
                  <strong>Special "GRINGO" Code</strong>: If you enter "GRINGO" as the inmate number and submit, the
                  next inmate number you enter will have the interface in English instead of Spanish.
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
              <h3 className="font-kings text-lg mb-2">Offender Profile Page</h3>

              <h4 className="font-medium mt-2 mb-1">Profile Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Displays personal information about the inmate (number, name, status, facility)</li>
                <li>No interactive buttons in this section</li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Cases Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Generar Moción / Generate Motion Button</strong>: Creates a legal motion related to the
                  specific case
                </li>
                <li>
                  <strong>Ver Detalles / View Details Button</strong>: Shows more detailed information about the
                  selected case
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Settings Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Notificaciones / Notifications Toggle</strong>: Enables or disables push notifications for the
                  application
                </li>
                <li>
                  <strong>Probar Notificación / Test Notification Button</strong>: Sends a test notification to verify
                  they're working
                </li>
                <li>
                  <strong>Notificaciones por Correo / Email Notifications Toggle</strong>: Enables or disables email
                  notifications
                </li>
                <li>
                  <strong>Notificaciones en la Aplicación / In-App Notifications Toggle</strong>: Enables or disables
                  notifications within the app
                </li>
                <li>
                  <strong>Recordatorios de Audiencias / Hearing Reminders Toggle</strong>: Enables or disables reminders
                  for upcoming hearings
                </li>
                <li>
                  <strong>Generación Automática de Mociones / Automatic Motion Generation Toggle</strong>: Enables or
                  disables automatic creation of legal motions
                </li>
                <li>
                  <strong>Notificaciones de Mociones / Motion Notifications Toggle</strong>: Enables or disables
                  notifications about motion status
                </li>
                <li>
                  <strong>Perfil Público / Public Profile Toggle</strong>: Controls whether profile information is
                  publicly visible
                </li>
                <li>
                  <strong>Mostrar Información de Casos / Show Case Information Toggle</strong>: Controls visibility of
                  case information
                </li>
                <li>
                  <strong>Editar Perfil / Edit Profile Button</strong>: Takes user to profile editing page
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSection === "admin" && (
        <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
          <h2 className="font-kings mb-2 text-xl">Admin Interface (Always in English)</h2>

          <div className="space-y-4">
            <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
              <h3 className="font-kings text-lg mb-2">Admin Dashboard</h3>

              <h4 className="font-medium mt-2 mb-1">Notifications Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Mark as Read Button</strong>: Marks unread notifications as read
                </li>
                <li>
                  <strong>Badge Counter</strong>: Shows the number of unread new offender registrations
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Offenders Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Search Button</strong>: Searches for inmates by number or name
                </li>
                <li>
                  <strong>View Details Button</strong>: Opens detailed view of a specific offender
                </li>
                <li>
                  <strong>Notify Profile Ready Button</strong>: Sends notification to offender that their profile is
                  ready to access
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Motions Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Edit Template Button</strong>: Opens editor for different motion templates (Dismiss, Bond
                  Reduction, Discovery, Attorney Change, Continuance)
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Settings Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Activate Buttons</strong>: For various system features (Automatic Notifications, Automatic
                  Motion Generation, Automatic Case Search, Calendar Sync, Automatic Data Backup)
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
              <h3 className="font-kings text-lg mb-2">Offender Detail Page (Admin View)</h3>

              <h4 className="font-medium mt-2 mb-1">Profile Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Search Information Button</strong>: Searches for inmate information in external systems
                </li>
                <li>
                  <strong>Notify Profile Ready Button</strong>: Sends notification that profile is ready to access
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Cases Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Edit Case Button</strong>: Opens case editor
                </li>
                <li>
                  <strong>Generate Motion Button</strong>: Creates a legal motion for the case
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Motions Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Generate Motion Buttons</strong>: For different motion types (Dismiss, Bond Reduction,
                  Discovery, Attorney Change, Continuance)
                </li>
              </ul>

              <h4 className="font-medium mt-2 mb-1">Notifications Tab</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Send Notification Button</strong>: Sends a custom notification to the offender
                </li>
                <li>
                  <strong>Schedule Reminder Button</strong>: Sets up a scheduled reminder for the offender
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-background/20 p-2 bg-foreground text-background">
        <h2 className="font-kings mb-2 text-xl">Key Features</h2>
        <div className="rounded-md border border-background/20 p-2 bg-background text-foreground">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>Language Toggle</strong>: The "GRINGO" code allows switching the offender interface from Spanish
              to English
            </li>
            <li>
              <strong>Notification System</strong>: Both push and in-app notifications for important updates
            </li>
            <li>
              <strong>Motion Generation</strong>: Tools to create legal motions for cases
            </li>
            <li>
              <strong>Admin Management</strong>: Tools for admins to manage offenders, cases, and notifications
            </li>
            <li>
              <strong>Custom Styling</strong>: All toggle switches now have the circle (thumb) matching the button color
              for visual consistency
            </li>
          </ol>

          <p className="mt-4">
            The system is designed to help inmates track their legal cases, receive notifications about hearings and
            case updates, and generate legal motions, while giving administrators tools to manage the system and help
            inmates navigate their legal proceedings.
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          className="bg-background text-foreground hover:bg-background/90"
          onClick={() => router.push("/dashboard/admin/tools")}
        >
          Back to Tools
        </Button>
      </div>
    </div>
  )
}

