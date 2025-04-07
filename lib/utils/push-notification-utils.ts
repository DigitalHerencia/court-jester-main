import { urlBase64ToUint8Array } from "./utils"

// Configuration for push notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

// Register the service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/notification-worker.ts')
    return registration
  } catch (error) {
    console.error('Error registering service worker:', error)
    return null
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }

    // Send the subscription to the server
    await saveSubscription(subscription)

    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return null
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      await deleteSubscription(subscription)
      return true
    }

    return false
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return false
  }
}

// Save the subscription to the server
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/notifications/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    throw error
  }
}

// Delete the subscription from the server
async function deleteSubscription(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/notifications/subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })
  } catch (error) {
    console.error('Error deleting push subscription:', error)
    throw error
  }
}

// Request background sync permission
export async function requestBackgroundSync(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready

    if (!('serviceWorker' in navigator) || !(registration as any).sync) {
      return false
    }

    await (registration as any).sync.register('check-court-dates')
    return true
  } catch (error) {
    console.error('Error requesting background sync:', error)
    return false
  }
}
// Schedule periodic background sync
export async function schedulePeriodicSync(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready as any

    if (!('serviceWorker' in navigator) || !('periodicSync' in registration)) {
      return false
    }

    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName
    })

    if (status.state === 'granted') {
      await registration.periodicSync.register('check-court-dates', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      })
      return true
    }

    return false
  } catch (error) {
    console.error('Error scheduling periodic sync:', error)
    return false
  }
}