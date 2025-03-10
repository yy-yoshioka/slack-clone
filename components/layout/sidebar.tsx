"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Home,
  MessageSquare,
  Bell,
  Settings,
  Hash,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Workspace {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Channel {
  id: string;
  name: string;
  workspace_id: string;
}

export function Sidebar() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [appsOpen, setAppsOpen] = useState(true);
  const [newChannelOpen, setNewChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const { data: workspace } = useQuery<Workspace | null>({
    queryKey: ["workspace", params.workspaceId],
    queryFn: async () => {
      if (!params.workspaceId) return null;

      const { data } = await supabase
        .from("workspaces")
        .select("id, name, logo_url")
        .eq("id", params.workspaceId)
        .single();

      return data;
    },
    enabled: !!params.workspaceId,
  });

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["channels", params.workspaceId],
    queryFn: async () => {
      if (!params.workspaceId) return [];

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // まずワークスペース内のすべてのチャンネルを取得
      const { data } = await supabase
        .from("channels")
        .select("id, name, workspace_id")
        .eq("workspace_id", params.workspaceId);

      if (!data) return [];

      // 型を明示的に指定
      return data.map((channel) => ({
        id: channel.id,
        name: channel.name,
        workspace_id: channel.workspace_id,
      }));
    },
    enabled: !!params.workspaceId,
  });

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !params.workspaceId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // チャンネル作成
      const { data: channel, error } = await supabase
        .from("channels")
        .insert([
          {
            name: newChannelName,
            workspace_id: params.workspaceId,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 作成者をメンバーとして追加
      if (channel) {
        await supabase.from("channel_members").insert([
          {
            channel_id: channel.id,
            user_id: user.id,
            workspace_id: params.workspaceId,
            role: "admin",
          },
        ]);
      }

      setNewChannelName("");
      setNewChannelOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="flex flex-col h-full text-primary bg-[#19171D]">
      {/* ワークスペースヘッダー */}
      <div className="flex items-center justify-between p-3 hover:bg-[#27242C] cursor-pointer border-b border-[#27242C]">
        <div className="flex items-center">
          <h2 className="font-bold text-white">
            {workspace?.name || "SlackClone"}
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/settings`
                    : "/settings"
                }
              >
                <Settings className="h-4 w-4 text-gray-400 hover:text-white" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Workspace Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* メインナビゲーション */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          <Link
            href={params.workspaceId ? `/workspace/${params.workspaceId}` : "/"}
            className="flex items-center p-2 rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Home</span>
          </Link>
          <Link
            href={
              params.workspaceId
                ? `/workspace/${params.workspaceId}/dms`
                : "/dms"
            }
            className="flex items-center p-2 rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>DMs</span>
          </Link>
          <Link
            href={
              params.workspaceId
                ? `/workspace/${params.workspaceId}/activity`
                : "/activity"
            }
            className="flex items-center p-2 rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span>Activity</span>
          </Link>
        </div>
      </div>

      {/* チャンネルセクション */}
      <div className="flex-1 overflow-y-auto px-2">
        <Collapsible
          open={channelsOpen}
          onOpenChange={setChannelsOpen}
          className="mb-2"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-sm font-medium text-gray-300 hover:text-white">
                <ChevronDown
                  className={`h-3 w-3 mr-1 transition-transform ${
                    channelsOpen ? "" : "transform -rotate-90"
                  }`}
                />
                <span>Channels</span>
              </button>
            </CollapsibleTrigger>

            <Dialog open={newChannelOpen} onOpenChange={setNewChannelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-md hover:bg-[#27242C] p-0"
                >
                  <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1D21] border-[#2F3136] text-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a new channel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateChannel} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Channel name
                    </Label>
                    <Input
                      id="name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. marketing"
                      className="bg-[#222529] border-[#383A40] text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-brand hover:bg-brand/90 text-white"
                  >
                    Create Channel
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <CollapsibleContent className="space-y-[2px]">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={
                    params.workspaceId
                      ? `/workspace/${params.workspaceId}/channels/${channel.name}`
                      : `/channels/${channel.name}`
                  }
                  className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
                >
                  <Hash className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>{channel.name}</span>
                </Link>
              ))
            ) : (
              <>
                <Link
                  href={
                    params.workspaceId
                      ? `/workspace/${params.workspaceId}/channels/general`
                      : "/channels/general"
                  }
                  className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
                >
                  <Hash className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>general</span>
                </Link>
                <Link
                  href={
                    params.workspaceId
                      ? `/workspace/${params.workspaceId}/channels/random`
                      : "/channels/random"
                  }
                  className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
                >
                  <Hash className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  <span>random</span>
                </Link>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* DMsセクション */}
        <Collapsible open={dmsOpen} onOpenChange={setDmsOpen} className="mb-2">
          <div className="flex items-center justify-between px-3 py-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-sm font-medium text-gray-300 hover:text-white">
                <ChevronDown
                  className={`h-3 w-3 mr-1 transition-transform ${
                    dmsOpen ? "" : "transform -rotate-90"
                  }`}
                />
                <span>Direct Messages</span>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-md hover:bg-[#27242C] p-0"
            >
              <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
            </Button>
          </div>

          <CollapsibleContent className="space-y-[2px]">
            <Link
              href={
                params.workspaceId
                  ? `/workspace/${params.workspaceId}/dm/slackbot`
                  : "/dm/slackbot"
              }
              className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
            >
              <span className="w-3.5 h-3.5 bg-green-500 rounded-full mr-2"></span>
              <span>Slackbot</span>
            </Link>
            <Link
              href={
                params.workspaceId
                  ? `/workspace/${params.workspaceId}/dm/you`
                  : "/dm/you"
              }
              className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
            >
              <span className="w-3.5 h-3.5 bg-yellow-500 rounded-full mr-2"></span>
              <span>you</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Appsセクション */}
        <Collapsible
          open={appsOpen}
          onOpenChange={setAppsOpen}
          className="mb-2"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center text-sm font-medium text-gray-300 hover:text-white">
                <ChevronDown
                  className={`h-3 w-3 mr-1 transition-transform ${
                    appsOpen ? "" : "transform -rotate-90"
                  }`}
                />
                <span>Apps</span>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-md hover:bg-[#27242C] p-0"
            >
              <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
            </Button>
          </div>

          <CollapsibleContent className="space-y-[2px]">
            <Link
              href={
                params.workspaceId
                  ? `/workspace/${params.workspaceId}/app/slackbot`
                  : "/app/slackbot"
              }
              className="flex items-center px-4 py-1.5 text-sm rounded hover:bg-[#27242C] text-gray-300 hover:text-white"
            >
              <span className="w-3.5 h-3.5 bg-purple-500 rounded-full mr-2"></span>
              <span>Slackbot</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
