// Types of notifications supported by the system
export type NotificationType = 
  | 'court_date'      // Upcoming court hearings
  | 'motion_status'   // Changes in motion status
  | 'system'          // System notifications
  | 'warning'         // Warning messages
  | 'reminder'        // General reminders

interface NotificationConfig {
  icon?: string
  badge?: string
  vibrate?: number[]
  data?: Record<string, unknown>
}

const DEFAULT_NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  court_date: {
    icon: '/icons/calendar.png',
    badge: '/icons/badge-calendar.png',
    vibrate: [100, 50, 100],
    data: { type: 'court_date' }
  },
  motion_status: {
    icon: '/icons/document.png',
    badge: '/icons/badge-document.png',
    vibrate: [100, 50, 100],
    data: { type: 'motion_status' }
  },
  system: {
    icon: '/icons/info.png',
    badge: '/icons/badge-info.png',
    data: { type: 'system' }
  },
  warning: {
    icon: '/icons/warning.png',
    badge: '/icons/badge-warning.png',
    vibrate: [200, 100, 200],
    data: { type: 'warning' }
  },
  reminder: {
    icon: '/icons/reminder.png',
    badge: '/icons/badge-reminder.png',
    vibrate: [50, 25, 50],
    data: { type: 'reminder' }
  }
}

// Check if the browser supports notifications
export function browserSupportsNotifications(): boolean {
  return "Notification" in window
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  if (!browserSupportsNotifications()) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

// Send a notification with type-specific configuration
export function sendNotification(
  type: NotificationType,
  title: string,
  options?: NotificationOptions
): boolean {
  if (!browserSupportsNotifications() || Notification.permission !== "granted") {
    return false
  }

  try {
    const config = DEFAULT_NOTIFICATION_CONFIG[type]
    const notification = new Notification(title, {
      ...config,
      ...options,
      // Ensure data includes the notification type
      data: { ...config.data, ...options?.data }
    })

    notification.addEventListener('click', () => {
      // Handle notification click based on type
      window.focus()
      if (notification.data?.url) {
        window.location.href = notification.data.url
      }
    })

    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

// Schedule notifications for court dates with backup reminders
export function scheduleCourtDateNotifications(
  hearingId: number,
  title: string,
  date: Date,
  options?: NotificationOptions
): number[] {
  const notificationIds: number[] = []
  const now = new Date()

  // Main notification schedules (days before)
  const schedules = [
    { days: 7, type: 'reminder' as NotificationType },
    { days: 3, type: 'reminder' as NotificationType },
    { days: 1, type: 'warning' as NotificationType },
    { days: 0, type: 'court_date' as NotificationType }
  ]

  schedules.forEach(({ days, type }) => {
    const notificationDate = new Date(date)
    notificationDate.setDate(date.getDate() - days)

    if (notificationDate > now) {
      const delay = notificationDate.getTime() - now.getTime()
      const timeoutId = window.setTimeout(() => {
        const message = days === 0
          ? `Court hearing today at ${date.toLocaleTimeString()}`
          : `Court hearing in ${days} day${days > 1 ? 's' : ''}`

        sendNotification(type, message, {
          ...options,
          data: {
            ...options?.data,
            hearingId,
            url: `/hearing/${hearingId}`
          }
        })
      }, delay)

      notificationIds.push(timeoutId)
    }
  })

  return notificationIds
}

// Cancel scheduled notifications
export function cancelScheduledNotifications(ids: number[]): void {
  ids.forEach(id => window.clearTimeout(id))
}

// Save notification preferences to local storage
export function saveNotificationPreferences(preferences: Record<string, boolean>): void {
  localStorage.setItem('notificationPreferences', JSON.stringify(preferences))
}

// Load notification preferences from local storage
export function loadNotificationPreferences(): Record<string, boolean> {
  const saved = localStorage.getItem('notificationPreferences')
  return saved ? JSON.parse(saved) : {
    court_date: true,
    motion_status: true,
    system: true,
    warning: true,
    reminder: true
  }
}

