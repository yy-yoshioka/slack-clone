"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBannerProps {
  onEnable?: () => void;
  onDismiss?: () => void;
}

export function NotificationBanner({
  onEnable,
  onDismiss,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Check if notifications are already enabled or the banner has been dismissed
  useEffect(() => {
    const notificationState = localStorage.getItem("notifications-state");

    if (notificationState !== "enabled" && notificationState !== "dismissed") {
      setIsVisible(true);
    }
  }, []);

  const handleEnable = () => {
    localStorage.setItem("notifications-state", "enabled");
    setIsVisible(false);
    onEnable?.();
  };

  const handleDismiss = () => {
    localStorage.setItem("notifications-state", "dismissed");
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 p-4 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Enable notifications</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">
            Get notified about new messages, mentions, and other activity.
          </p>

          <div className="flex gap-2">
            <Button onClick={handleEnable} className="flex-1" variant="default">
              Enable notifications
            </Button>
            <Button onClick={handleDismiss} variant="outline">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
