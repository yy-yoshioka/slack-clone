"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Hash,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  Home,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogoutButton } from "@/components/auth/logout-button";

interface SidebarProps {
  workspaces: {
    id: string;
    name: string;
    channels: {
      id: string;
      name: string;
    }[];
  }[];
  currentWorkspaceId?: string;
}

export function Sidebar({ workspaces = [], currentWorkspaceId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<
    Record<string, boolean>
  >({});

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }));
  };

  const currentWorkspace = workspaces.find(
    (workspace) => workspace.id === currentWorkspaceId
  );

  return (
    <div className="flex flex-col h-full border-r bg-gray-50 dark:bg-gray-900">
      <div className="p-4 border-b">
        <Link href="/">
          <h1 className="text-xl font-bold flex items-center">
            <span>SlackClone</span>
          </h1>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            <Link href="/">
              <Button
                variant="ghost"
                className={cn("w-full justify-start", {
                  "bg-gray-200 dark:bg-gray-800": pathname === "/",
                })}
                size="sm"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>

            <Link href="/workspaces">
              <Button
                variant="ghost"
                className={cn("w-full justify-start", {
                  "bg-gray-200 dark:bg-gray-800": pathname === "/workspaces",
                })}
                size="sm"
              >
                <Users className="mr-2 h-4 w-4" />
                Workspaces
              </Button>
            </Link>
          </div>

          {workspaces.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
                Workspaces
              </h2>
              <div className="space-y-1">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => toggleWorkspace(workspace.id)}
                    >
                      {expandedWorkspaces[workspace.id] ? (
                        <ChevronDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      {workspace.name}
                    </Button>

                    {expandedWorkspaces[workspace.id] && (
                      <div className="pl-4 space-y-1">
                        <Link href={`/${workspace.id}`}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-gray-600 dark:text-gray-400",
                              {
                                "bg-gray-200 dark:bg-gray-800":
                                  pathname === `/${workspace.id}`,
                              }
                            )}
                            size="sm"
                          >
                            General
                          </Button>
                        </Link>

                        {workspace.channels.map((channel) => (
                          <Link
                            key={channel.id}
                            href={`/${workspace.id}/${channel.id}`}
                          >
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-gray-600 dark:text-gray-400",
                                {
                                  "bg-gray-200 dark:bg-gray-800":
                                    pathname ===
                                    `/${workspace.id}/${channel.id}`,
                                }
                              )}
                              size="sm"
                            >
                              <Hash className="mr-2 h-4 w-4" />
                              {channel.name}
                            </Button>
                          </Link>
                        ))}

                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-600 dark:text-gray-400"
                          size="sm"
                          onClick={() =>
                            router.push(`/${workspace.id}/create-channel`)
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Channel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 dark:text-gray-400 mt-2"
                  size="sm"
                  onClick={() => router.push("/workspaces/create")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <div className="flex flex-col gap-2">
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <LogoutButton
            variant="ghost"
            className="w-full justify-start"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
