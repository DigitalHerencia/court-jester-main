/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="dom" />

// Custom interface updates with proper modifiers:
interface PeriodicSyncEvent extends ExtendableEvent {
  readonly tag: string;
  waitUntil(promise: Promise<void>): void;
}

interface ServiceWorkerRegistration {
  addEventListener ( arg0: string, arg1: ( event: PushEvent ) => void ): unknown;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
}

export interface ServiceWorkerGlobalScope {
  readonly registration: ServiceWorkerRegistration;
  readonly clients: Clients;
}

export interface NotificationEvent extends ExtendableEvent {
  readonly notification: Notification;
  waitUntil(promise: Promise<void>): void;
  readonly action: string;
}

export interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
  waitUntil(promise: Promise<void>): void;
}

interface HearingReminder {
  type: 'email' | 'push' | 'sms';
  daysBeforeDate: number;
}

interface Hearing {
  id: string;
  date: string;
  title: string;
  reminders: HearingReminder[];
}

// Handle push notifications
(self as unknown as ServiceWorkerGlobalScope).registration.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, options } = data;

  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(title, {
      ...options,
      icon: options.icon || '/icons/default.png',
      badge: options.badge || '/icons/badge.png',
      vibrate: options.vibrate || [100, 50, 100],
      data: {
        ...options.data,
        url: options.data?.url || '/'
      }
    })
  );
});

// Handle notification clicks
(self as any).addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' }).then((clientList: WindowClient[]) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return (self as unknown as ServiceWorkerGlobalScope).clients.openWindow(url);
    })
  );
});

// Handle notification close events


// Periodic sync for court date reminders
self.addEventListener('periodicsync', (event) => {
  const psEvent = event as PeriodicSyncEvent;
  if (psEvent.tag === 'check-court-dates') {
    psEvent.waitUntil(checkUpcomingCourtDates());
  }
});

async function checkUpcomingCourtDates(): Promise<void> {
  try {
    const response = await fetch('/api/notifications/check-court-dates');
    const data: { hearings: Hearing[] } = await response.json();

    for (const hearing of data.hearings) {
      const { id, date, title, reminders } = hearing;

      reminders.forEach(({ type, daysBeforeDate }) => {
        const reminderDate = new Date(date);
        reminderDate.setDate(reminderDate.getDate() - daysBeforeDate);

        if (reminderDate > new Date()) {
          (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(`Court Date Reminder: ${title}`, {
            body: `You have a court date in ${daysBeforeDate} days`,
            icon: '/icons/calendar.png',
            badge: '/icons/badge-calendar.png',
            data: {
              id,
              url: `/hearing/${id}`,
              type
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Error checking court dates:', error);
  }
}
