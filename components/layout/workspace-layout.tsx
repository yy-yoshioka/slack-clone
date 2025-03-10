"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { User } from "@supabase/supabase-js";

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
    <div className="flex h-screen overflow-hidden">
      <div className="h-full hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          user={user}
          workspaceId={workspaceId}
          channelId={channelId}
          profile={profile}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
