import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface DashboardHeaderProps {
  role: "admin" | "offender"
  offenderId?: string
  unreadCount?: number
}

export default function DashboardHeader({ role, offenderId, unreadCount = 0 }: DashboardHeaderProps) {
  const notificationsLink =
    role === "admin" ? "/admin/dashboard/notifications" : `/offender/dashboard/${offenderId}/notifications`

  return (
    <header className="flex justify-between items-center py-4 border-b border-foreground/10 mb-6">
      <Link
        href={role === "admin" ? "/admin/dashboard" : `/offender/dashboard/${offenderId}`}
        className="font-jacquard text-2xl sm:text-3xl"
      >
        Court Jester
      </Link>
      <div className="flex items-center space-x-4">
        <Link href={notificationsLink}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}

