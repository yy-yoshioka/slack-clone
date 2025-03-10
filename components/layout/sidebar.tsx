"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Home,
  MessageSquare,
  Bell,
  Search,
  PlusCircle,
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

  // ユーザーのワークスペース一覧を取得
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

  // 現在選択中のワークスペース情報を取得
  const { data: currentWorkspace } = useQuery<Workspace | null>({
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

  // 現在のワークスペースのチャンネル一覧を取得
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
    <div className="flex h-full">
      {/* ワークスペースサイドバー - Slackの左端部分 */}
      <div className="w-14 bg-[#3F0E40] flex flex-col items-center py-3 space-y-3 border-r border-[#522653]">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/workspace/${workspace.id}`}
            className={`w-9 h-9 rounded flex items-center justify-center text-white transition-all duration-200 ${
              params.workspaceId === workspace.id
                ? "bg-white text-[#3F0E40]"
                : "bg-[#4A154B] hover:bg-[#4C9689] hover:text-white"
            } hover:rounded-lg`}
          >
            {workspace.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              workspace.name.charAt(0).toUpperCase()
            )}
          </Link>
        ))}

        {/* ワークスペース追加ボタン */}
        <Link
          href="/workspace/create"
          className="w-9 h-9 rounded flex items-center justify-center text-white bg-[#4A154B] hover:bg-[#4C9689] transition-all duration-200 hover:rounded-lg"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {/* メインサイドバー - チャンネル一覧など */}
      <div className="w-56 flex flex-col h-full text-white bg-[#3F0E40]">
        {/* ワークスペースヘッダー */}
        <div className="flex items-center justify-between p-3 hover:bg-[#350D36] cursor-pointer border-b border-[#522653] mb-2">
          <div className="flex items-center">
            <h2 className="font-bold text-white">
              {currentWorkspace?.name || "SlackClone"}
            </h2>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#350D36] rounded-full p-1"
                >
                  <span className="sr-only">New message</span>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 検索ボタン - Slackのジャンプボタン */}
        <button className="mx-3 mb-3 flex items-center h-8 px-3 rounded border border-[#565856] text-[#BCABBC] text-sm hover:bg-[#350D36] hover:border-[#350D36] hover:text-white">
          <Search className="h-3.5 w-3.5 mr-2" />
          <span>Search {currentWorkspace?.name}</span>
        </button>

        {/* メインナビゲーション */}
        <div className="px-3 space-y-1">
          <Link
            href={params.workspaceId ? `/workspace/${params.workspaceId}` : "/"}
            className="flex items-center p-1.5 rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm">Home</span>
          </Link>
          <Link
            href={
              params.workspaceId
                ? `/workspace/${params.workspaceId}/dms`
                : "/dms"
            }
            className="flex items-center p-1.5 rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-sm">DMs</span>
          </Link>
          <Link
            href={
              params.workspaceId
                ? `/workspace/${params.workspaceId}/activity`
                : "/activity"
            }
            className="flex items-center p-1.5 rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm">Activity</span>
          </Link>
        </div>

        {/* チャンネルセクション */}
        <div className="flex-1 overflow-y-auto px-2 mt-3">
          <Collapsible
            open={channelsOpen}
            onOpenChange={setChannelsOpen}
            className="mb-2"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium text-[#BCABBC] hover:text-white">
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
                    className="h-5 w-5 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                      className="bg-[#4A154B] hover:bg-[#611f69] text-white"
                    >
                      Create Channel
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <CollapsibleContent className="space-y-0.5">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={
                      params.workspaceId
                        ? `/workspace/${params.workspaceId}/channel/${channel.id}`
                        : `/channel/${channel.id}`
                    }
                    className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
                  >
                    <Hash className="h-3.5 w-3.5 mr-2 text-[#BCABBC]" />
                    <span>{channel.name}</span>
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href={
                      params.workspaceId
                        ? `/workspace/${params.workspaceId}/channel/general`
                        : "/channel/general"
                    }
                    className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
                  >
                    <Hash className="h-3.5 w-3.5 mr-2 text-[#BCABBC]" />
                    <span>general</span>
                  </Link>
                  <Link
                    href={
                      params.workspaceId
                        ? `/workspace/${params.workspaceId}/channel/random`
                        : "/channel/random"
                    }
                    className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
                  >
                    <Hash className="h-3.5 w-3.5 mr-2 text-[#BCABBC]" />
                    <span>random</span>
                  </Link>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* DMsセクション */}
          <Collapsible
            open={dmsOpen}
            onOpenChange={setDmsOpen}
            className="mb-2"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium text-[#BCABBC] hover:text-white">
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
                className="h-5 w-5 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <CollapsibleContent className="space-y-0.5">
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/dm/slackbot`
                    : "/dm/slackbot"
                }
                className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
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
                className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
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
            <div className="flex items-center justify-between px-2 py-1.5">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium text-[#BCABBC] hover:text-white">
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
                className="h-5 w-5 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <CollapsibleContent className="space-y-0.5">
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/app/slackbot`
                    : "/app/slackbot"
                }
                className="flex items-center pl-5 pr-2 py-1 text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white"
              >
                <span className="w-3.5 h-3.5 bg-purple-500 rounded-full mr-2"></span>
                <span>Slackbot</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
