"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Hash,
  Home,
  MessageSquare,
  Plus,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Workspace {
  id: string;
  name: string;
  logo_url: string | null;
}

export function Sidebar() {
  const params = useParams();
  const supabase = createClientComponentClient();

  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: workspaceMembers } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace:workspaces (
            id,
            name,
            logo_url
          )
        `
        )
        .eq("user_id", user.id);

      if (!workspaceMembers) return [];

      return workspaceMembers.map((member) => {
        const workspace = member.workspace as unknown as Workspace;
        return workspace;
      });
    },
  });

  return (
    <div className="flex flex-col gap-y-4 h-full text-primary bg-[#19171D] p-2">
      <div className="flex flex-col gap-y-2">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/workspace/${workspace.id}`}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg hover:rounded-2xl transition-all duration-200",
              params.workspaceId === workspace.id
                ? "bg-brand/30 text-brand"
                : "hover:bg-[#27242C]"
            )}
          >
            {workspace.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="w-8 h-8 rounded"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-brand/30 text-brand flex items-center justify-center">
                {workspace.name[0].toUpperCase()}
              </div>
            )}
          </Link>
        ))}
        <Link
          href="/workspace/create"
          className="flex items-center justify-center w-12 h-12 rounded-lg hover:rounded-2xl transition-all duration-200 hover:bg-[#27242C]"
        >
          <div className="w-8 h-8 rounded bg-[#27242C] hover:bg-[#363139] flex items-center justify-center">
            +
          </div>
        </Link>
      </div>

      {/* Channel Sidebar */}
      {params.workspaceId ? (
        <div className="flex-1 flex flex-col bg-[#19171D] text-gray-300">
          {/* Workspace Header */}
          <div className="p-3 border-b border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/5"
              asChild
            >
              <Link href={`/${params.workspaceId}`}>
                <span className="font-semibold">
                  {workspaces.find(
                    (w: Workspace) => w.id === params.workspaceId
                  )?.name || "Loading..."}
                </span>
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-2 py-3">
              {/* Home Section */}
              <div className="space-y-1">
                <Link
                  href={`/${params.workspaceId}`}
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
                <Link
                  href={`/${params.workspaceId}/dms`}
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  DMs
                </Link>
                <Link
                  href={`/${params.workspaceId}/activity`}
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Activity
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm hover:bg-white/5"
                >
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  More
                </Button>
              </div>

              {/* Channels Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400">
                  <button className="flex items-center hover:text-gray-200">
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Channels
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    asChild
                  >
                    <Link href={`/${params.workspaceId}/channels/create`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-[2px]">
                  <Link
                    href={`/${params.workspaceId}/channels/all-test`}
                    className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  >
                    <Hash className="w-3 h-3 mr-2 opacity-60" />
                    all-test
                  </Link>
                  <Link
                    href={`/${params.workspaceId}/channels/social`}
                    className="flex items-center px-2 py-1.5 text-sm rounded bg-white/5 text-white"
                  >
                    <Hash className="w-3 h-3 mr-2" />
                    social
                  </Link>
                  <Link
                    href={`/${params.workspaceId}/channels/test`}
                    className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  >
                    <Hash className="w-3 h-3 mr-2 opacity-60" />
                    test
                  </Link>
                </div>
              </div>

              {/* Direct Messages Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400">
                  <button className="flex items-center hover:text-gray-200">
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Direct messages
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    asChild
                  >
                    <Link href={`/${params.workspaceId}/dms/new`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-[2px]">
                  <Link
                    href={`/${params.workspaceId}/dms/you`}
                    className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  >
                    <span className="w-3 h-3 mr-2 text-xs opacity-60">🧑</span>
                    you
                  </Link>
                </div>
              </div>

              {/* Apps Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400">
                  <button className="flex items-center hover:text-gray-200">
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Apps
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    asChild
                  >
                    <Link href={`/${params.workspaceId}/apps/add`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-[2px]">
                  <Link
                    href={`/${params.workspaceId}/apps/slackbot`}
                    className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5 text-gray-400 hover:text-gray-200"
                  >
                    <span className="w-3 h-3 mr-2 text-xs opacity-60">🤖</span>
                    Slackbot
                  </Link>
                </div>
              </div>

              {/* Add Channel Button */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-white/5"
                  asChild
                >
                  <Link href={`/${params.workspaceId}/channels/create`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add channels
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-[#19171D] text-gray-300">
          <div className="p-3 border-b border-white/10">
            <span className="font-semibold text-white">SlackClone</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-2 py-3">
              <div className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
                <Link
                  href="/dms"
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  DMs
                </Link>
                <Link
                  href="/activity"
                  className="flex items-center px-2 py-1.5 text-sm rounded hover:bg-white/5"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
