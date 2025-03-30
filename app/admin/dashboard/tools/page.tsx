import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileUp, Database, Camera, UserPlus, FileEdit, HelpCircle, ArrowRight } from "lucide-react"

export default function AdminToolsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Administrative Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Case Upload Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Case Upload
            </CardTitle>
            <CardDescription>Upload and process case files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import case files in PDF format to automatically extract and create case records.
            </p>
            <Link
              href="/admin/dashboard/tools/case-upload"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Case Upload
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Database Reset Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Manage database operations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Reset database, run migrations, or perform maintenance operations.
            </p>
            <Link
              href="/admin/dashboard/tools/database-reset"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Database Management
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Mugshot Upload Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Mugshot Upload
            </CardTitle>
            <CardDescription>Upload offender mugshots</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and manage offender mugshot images.
            </p>
            <Link
              href="/admin/dashboard/tools/mugshot-upload"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Mugshot Upload
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Offender Profile Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Offender Profile
            </CardTitle>
            <CardDescription>Create and edit offender profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create new offender profiles or edit existing ones.
            </p>
            <Link
              href="/admin/dashboard/tools/offender-profile"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Offender Profile
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Motions Editor Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Motions Editor
            </CardTitle>
            <CardDescription>Create and edit motion templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and manage motion templates for offenders.
            </p>
            <Link
              href="/admin/dashboard/tools/motions-editor"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Motions Editor
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Help Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Documentation
            </CardTitle>
            <CardDescription>Access help resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View documentation and help resources for administrators.
            </p>
            <Link
              href="/admin/dashboard/tools/help"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Go to Help
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
