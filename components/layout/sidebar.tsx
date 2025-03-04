"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, Home, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogoutButton } from "@/components/auth/logout-button";
import { ChannelList } from "@/components/channels/channel-list";

interface Workspace {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface SidebarProps {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
  channels?: Channel[];
}

export function Sidebar({
  workspaces,
  currentWorkspaceId,
  channels = [],
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-3 border-b border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-lg font-medium"
          onClick={() => router.push("/")}
        >
          SlackClone
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start my-1",
                pathname === "/" && "bg-sidebar-accent"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>

          {workspaces.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold px-3 py-2">WORKSPACES</h3>
              <div className="space-y-[2px]">
                {workspaces.map((workspace) => (
                  <Link key={workspace.id} href={`/${workspace.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        pathname.startsWith(`/${workspace.id}`) &&
                          "bg-sidebar-accent"
                      )}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {workspace.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 mb-2">
            <Link href="/workspaces/create">
              <Button size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </Link>
          </div>
        </div>

        {currentWorkspaceId && (
          <div className="mt-6 px-2">
            <ChannelList channels={channels} workspaceId={currentWorkspaceId} />
          </div>
        )}
      </ScrollArea>

      <div className="p-3 mt-auto border-t border-sidebar-border">
        <LogoutButton className="w-full" />
      </div>
    </div>
  );
}
