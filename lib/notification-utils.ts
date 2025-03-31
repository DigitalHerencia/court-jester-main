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

// Send a notification
export function sendNotification(title: string, options?: NotificationOptions): boolean {
  if (!browserSupportsNotifications() || Notification.permission !== "granted") {
    return false
  }

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

// Schedule a notification for a future date
export function scheduleNotification(title: string, date: Date, options?: NotificationOptions): number {
  const now = new Date()
  const delay = date.getTime() - now.getTime()

  if (delay <= 0) {
    return -1
  }

  return window.setTimeout(() => {
    sendNotification(title, options)
  }, delay)
}

