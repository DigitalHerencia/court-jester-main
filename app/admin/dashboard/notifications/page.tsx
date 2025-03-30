"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/admin/notifications", {
          credentials: "include", // Ensure cookies are sent
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load notifications. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark notification as read");
      }
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      const response = await fetch(`/api/admin/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({ ids: unreadIds }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to mark all notifications as read");
      }
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold font-kings">Loading notifications...</div>
          <div className="text-foreground/60 font-kings">
            Please wait while we fetch your notifications.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-foreground font-kings">Error</div>
          <div className="mb-4 text-foreground/60 font-kings">{error}</div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-background/20 p-4 bg-foreground text-background">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-kings text-xl">Recent Notifications</h2>
          {notifications.some((n) => !n.read) && (
            <Button 
              className="bg-background text-foreground border border-foreground/20 hover:bg-background/90 font-kings"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-md border border-background/20 p-6 text-center bg-background text-foreground">
            <div className="mb-2 text-xl font-semibold font-kings">No notifications</div>
            <p className="text-foreground/60 font-kings">
              You don&apos;t have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-md border border-background/20 p-4 bg-background text-foreground"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-kings font-medium text-lg mb-1 italic">
                      {notification.type}
                    </h3>
                    <p className="font-kings mb-2">{notification.message}</p>
                    <p className="text-sm text-foreground/70 font-kings italic">
                      {new Date(notification.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                              <Button 
                              className=
                              "w-full bg-foreground text-background hover:bg-background hover:text-foreground"
                              onClick={() => markAsRead(notification.id)}
                              >
                              Mark as Read
                              </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}