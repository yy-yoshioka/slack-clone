"use client";

import Link from "next/link";
import { UserMenu } from "@/components/layout/user-menu";
import { User } from "@supabase/supabase-js";
import { Hash, Info, Users, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 bg-white dark:bg-gray-950 z-10 shadow-sm">
      <div className="flex items-center space-x-2">
        {channelName ? (
          <div className="flex items-center">
            <Hash className="h-5 w-5 text-gray-500 mr-1 flex-shrink-0" />
            <h1 className="text-lg font-semibold truncate">{channelName}</h1>
          </div>
        ) : workspaceName ? (
          <h1 className="text-lg font-semibold">{workspaceName}</h1>
        ) : (
          <Link href="/">
            <h1 className="text-lg font-semibold">SlackClone</h1>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {channelId && workspaceId && memberCount > 0 && (
          <div className="flex items-center gap-3 mr-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              asChild
            >
              <Link href={`/${workspaceId}/${channelId}/members`}>
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{memberCount}</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              asChild
            >
              <Link href={`/${workspaceId}/${channelId}/details`}>
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Details</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${workspaceId}/${channelId}/members`}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View all members
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${workspaceId}/${channelId}/files`}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View all files
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${workspaceId}/${channelId}/settings`}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Channel settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <UserMenu user={user} profile={profile} />
      </div>
    </header>
  );
}
