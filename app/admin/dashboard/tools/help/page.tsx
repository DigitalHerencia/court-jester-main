import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, FileQuestion, MessageSquareIcon as MessageSquareHelp } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="card-secondary space-y-6 p-4">
      <h1 className="font-kings text-3xl text-background mb-6">Help & Documentation</h1>

      <Tabs className="w-full" defaultValue="faq">
        <TabsList className="mb-4">
          <TabsTrigger className="font-kings text-background" value="faq">
            FAQ
          </TabsTrigger>
          <TabsTrigger className="font-kings text-background" value="guides">
            Guides
          </TabsTrigger>
          <TabsTrigger className="font-kings text-background" value="support">
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-kings text-foreground">
                <FileQuestion className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-foreground">
                Common questions and answers about the Court Jester system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion collapsible className="w-full" type="single">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-kings text-foreground">
                    How do I add a new offender?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      You can add a new offender by going to the Offender Profile tool in the Admin Tools section. Click
                      on &quot;Create New Offender&quot; and fill out the required information. Alternatively, you can go to the
                      Offenders page and click the &quot;Add Offender&quot; button.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-kings text-foreground">
                    How do I upload a mugshot?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      To upload a mugshot, go to the Mugshot Upload tool in the Admin Tools section. Search for the
                      offender by name or inmate number, select them from the results, and then upload the image file.
                      Supported formats include JPG, PNG, and GIF.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-kings text-foreground">
                    How do I create a new case?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Cases can be created in two ways:
                      <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>
                          Manually through the Cases page by clicking &quot;Add Case&quot; and filling out the form
                        </li>
                        <li>
                          By uploading case files through the Case Upload tool in Admin Tools, which will automatically
                          extract case information
                        </li>
                      </ol>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-kings text-foreground">
                    How do I reset the database?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Database reset is a destructive action that should only be performed in development environments
                      or when setting up a new instance. To reset the database, go to the Database Management tool in
                      Admin Tools, select the &quot;Database Reset&quot; tab, and follow the confirmation steps.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-kings text-foreground">
                    How do offenders access the system?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Offenders can access the system by logging in with their inmate number. They will only be able to
                      view their own information, cases, and notifications. They cannot see other offenders&apos; data or
                      administrative functions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-kings text-foreground">
                <Book className="h-5 w-5" />
                User Guides
              </CardTitle>
              <CardDescription className="text-foreground">
                Step-by-step guides for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-kings mb-2 text-foreground">Case Management Guide</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to effectively manage cases in the Court Jester system.
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Navigate to the Cases page from the main dashboard</li>
                    <li>Use the search function to find specific cases</li>
                    <li>Click on a case to view its details</li>
                    <li>Use the &quot;Edit&quot; button to modify case information</li>
                    <li>Use the &quot;Add Motion&quot; button to create a new motion for the case</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-kings mb-2 text-foreground">Offender Profile Management</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to create and manage offender profiles.
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Go to the Offender Profile tool in Admin Tools</li>
                    <li>Click &quot;Create New Offender&quot; to add a new profile</li>
                    <li>Fill out all required fields (inmate number, name, status)</li>
                    <li>Add optional information as available</li>
                    <li>Upload a mugshot using the Mugshot Upload tool</li>
                    <li>Link cases to the offender as needed</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-kings mb-2 text-foreground">Motion Templates</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to create and use motion templates.
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-sm">
                    <li>Navigate to the Motions Editor tool in Admin Tools</li>
                    <li>Click &quot;Create Template&quot; to start a new template</li>
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
          <Card className="card-content">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-kings text-foreground">
                <MessageSquareHelp className="h-5 w-5" />
                Support Resources
              </CardTitle>
              <CardDescription className="text-foreground">
                Get help with the Court Jester system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-kings mb-2 text-foreground">Contact Support</h3>
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
                  <h3 className="text-lg font-kings mb-2 text-foreground">System Requirements</h3>
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
                  <h3 className="text-lg font-kings mb-2 text-foreground">Training Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional training resources are available:
                  </p>
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
