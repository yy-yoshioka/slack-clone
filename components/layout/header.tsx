"use client";

import Link from "next/link";
import { UserMenu } from "@/components/layout/user-menu";
import { User } from "@supabase/supabase-js";
import { Hash, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: User | null;
  profile: {
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  workspaceName?: string;
  channelName?: string;
  channelId?: string;
  workspaceId?: string;
  memberCount?: number;
}

export function Header({
  user,
  profile,
  workspaceName,
  channelName,
  channelId,
  workspaceId,
  memberCount = 0,
}: HeaderProps) {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center space-x-1">
        {channelName ? (
          <>
            <Hash className="h-5 w-5 text-gray-500" />
            <h1 className="text-lg font-semibold">{channelName}</h1>
          </>
        ) : workspaceName ? (
          <h1 className="text-lg font-semibold">{workspaceName}</h1>
        ) : (
          <Link href="/">
            <h1 className="text-lg font-semibold">SlackClone</h1>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {channelId && workspaceId && (
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/${workspaceId}/${channelId}/details`}>
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </Button>
        )}

        {memberCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/${workspaceId}/${channelId}/members`}>
              <Users className="h-4 w-4" />
              <span>{memberCount}</span>
            </Link>
          </Button>
        )}

        <UserMenu user={user} profile={profile} />
      </div>
    </header>
  );
}
