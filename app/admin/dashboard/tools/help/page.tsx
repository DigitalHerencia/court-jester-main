"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ArrowLeft, HelpCircle } from "lucide-react"

export default function HelpContentPage() {
  const [activeTab, setActiveTab] = useState("offender")
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            Help Content Management
          </CardTitle>
          <CardDescription>
            View and manage the help content for the Court Jester application. This content is displayed to users when
            they access the help system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offender">Offender Interface</TabsTrigger>
              <TabsTrigger value="admin">Admin Interface</TabsTrigger>
            </TabsList>

            <TabsContent value="offender" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Offender Interface (Available in Spanish and English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Login Page</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>BUSCAR AHORA / SEARCH NOW Button</strong>: Submits the inmate number to authenticate and
                        access the system.
                      </li>
                      <li>
                        <strong>Special "GRINGO" Code</strong>: If you enter "GRINGO" as the inmate number and submit,
                        the next inmate number you enter will have the interface in English instead of Spanish.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Offender Profile Page</h3>

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
                        <strong>Notificaciones / Notifications Toggle</strong>: Enables or disables push notifications
                        for the application
                      </li>
                      <li>
                        <strong>Probar Notificación / Test Notification Button</strong>: Sends a test notification to
                        verify they're working
                      </li>
                      <li>
                        <strong>Notificaciones por Correo / Email Notifications Toggle</strong>: Enables or disables
                        email notifications
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Interface (Always in English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>

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
                        <strong>Notify Profile Ready Button</strong>: Sends notification to offender that their profile
                        is ready to access
                      </li>
                    </ul>

                    <h4 className="font-medium mt-2 mb-1">Admin Tools</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Create Offender Profile</strong>: Tool to create new offender profiles
                      </li>
                      <li>
                        <strong>Upload Case File</strong>: Tool to upload and process case files
                      </li>
                      <li>
                        <strong>Upload Mugshot</strong>: Tool to upload offender mugshots
                      </li>
                      <li>
                        <strong>Database Management</strong>: Tools to manage the database
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  <strong>Language Toggle</strong>: The "GRINGO" code allows switching the offender interface from
                  Spanish to English
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
              </ol>

              <p className="mt-4">
                The system is designed to help inmates track their legal cases, receive notifications about hearings and
                case updates, and generate legal motions, while giving administrators tools to manage the system and
                help inmates navigate their legal proceedings.
              </p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push("/admin/dashboard/tools")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tools
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

