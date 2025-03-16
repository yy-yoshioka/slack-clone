"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { User } from "@supabase/supabase-js";
import { NotificationBanner } from "@/components/notification-banner";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: {
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  workspaceId?: string;
  channelId?: string;
}

export function WorkspaceLayout({
  children,
  user,
  profile,
  workspaceId,
  channelId,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="h-full hidden md:block border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <Header
          user={user}
          workspaceId={workspaceId}
          channelId={channelId}
          profile={profile}
        />
        <main className="flex-1 overflow-auto relative pt-2">
          <div className="container mx-auto max-w-6xl px-4 pb-4">
            {children}
          </div>
        </main>
      </div>

      <NotificationBanner
        onEnable={() => {
          // Request notification permissions
          if ("Notification" in window) {
            Notification.requestPermission();
          }
        }}
      />
    </div>
  );
}
