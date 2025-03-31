import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, FileQuestion, MessageSquareIcon as MessageSquareHelp } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions and answers about the Court Jester system</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I add a new offender?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      You can add a new offender by going to the Offender Profile tool in the Admin Tools section. Click
                      on "Create New Offender" and fill out the required information. Alternatively, you can go to the
                      Offenders page and click the "Add Offender" button.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I upload a mugshot?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      To upload a mugshot, go to the Mugshot Upload tool in the Admin Tools section. Search for the
                      offender by name or inmate number, select them from the results, and then upload the image file.
                      Supported formats include JPG, PNG, and GIF.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I create a new case?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Cases can be created in two ways:
                      <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>Manually through the Cases page by clicking "Add Case" and filling out the form</li>
                        <li>
                          By uploading case files through the Case Upload tool in Admin Tools, which will automatically
                          extract case information
                        </li>
                      </ol>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I reset the database?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Database reset is a destructive action that should only be performed in development environments
                      or when setting up a new instance. To reset the database, go to the Database Management tool in
                      Admin Tools, select the "Database Reset" tab, and follow the confirmation steps.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do offenders access the system?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Offenders can access the system by logging in with their inmate number. They will only be able to
                      view their own information, cases, and notifications. They cannot see other offenders' data or
                      administrative functions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                User Guides
              </CardTitle>
              <CardDescription>Step-by-step guides for common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Case Management Guide</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to effectively manage cases in the Court Jester system.
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Navigate to the Cases page from the main dashboard</li>
                    <li>Use the search function to find specific cases</li>
                    <li>Click on a case to view its details</li>
                    <li>Use the "Edit" button to modify case information</li>
                    <li>Use the "Add Motion" button to create a new motion for the case</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Offender Profile Management</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to create and manage offender profiles.
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Go to the Offender Profile tool in Admin Tools</li>
                    <li>Click "Create New Offender" to add a new profile</li>
                    <li>Fill out all required fields (inmate number, name, status)</li>
                    <li>Add optional information as available</li>
                    <li>Upload a mugshot using the Mugshot Upload tool</li>
                    <li>Link cases to the offender as needed</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Motion Templates</h3>
                  <p className="text-sm text-muted-foreground mb-2">Learn how to create and use motion templates.</p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Navigate to the Motions Editor tool in Admin Tools</li>
                    <li>Click "Create Template" to start a new template</li>
                    <li>Use the rich text editor to create the motion content</li>
                    <li>Add placeholders for dynamic content using the format {"{placeholder}"} </li>
                    <li>Save the template and assign it to appropriate case types</li>
                    <li>Templates will be available to offenders when creating motions</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareHelp className="h-5 w-5" />
                Support Resources
              </CardTitle>
              <CardDescription>Get help with the Court Jester system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">
                    For technical issues or questions, please contact the support team:
                  </p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                    <li>Email: support@courtjester.example.com</li>
                    <li>Phone: (555) 123-4567</li>
                    <li>Hours: Monday-Friday, 9am-5pm EST</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">System Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    Court Jester is a web-based application that works best with:
                  </p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                    <li>Modern browsers (Chrome, Firefox, Edge, Safari)</li>
                    <li>JavaScript enabled</li>
                    <li>Minimum screen resolution of 1280x720</li>
                    <li>Stable internet connection</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Training Resources</h3>
                  <p className="text-sm text-muted-foreground">Additional training resources are available:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                    <li>Video tutorials (coming soon)</li>
                    <li>Monthly webinars for administrators</li>
                    <li>Printable quick-start guides</li>
                    <li>On-site training available upon request</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

