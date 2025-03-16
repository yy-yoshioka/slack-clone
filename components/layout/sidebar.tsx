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
  MessageCircle,
  Headphones,
  MoreVertical,
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
import { useSidebarSection } from "@/lib/sidebar-state";
import Image from "next/image";

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

  // Replace individual state management with our custom hook
  const [channelsOpen, toggleChannels] = useSidebarSection("channels", true);
  const [dmsOpen, toggleDMs] = useSidebarSection("directMessages", true);
  const [appsOpen, toggleApps] = useSidebarSection("apps", true);

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
      <div className="w-14 bg-[#3F0E40] flex flex-col items-center py-4 space-y-4 border-r border-[#522653]">
        {/* ワークスペースアイコン */}
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/workspace/${workspace.id}`}
            className={`w-10 h-10 rounded flex items-center justify-center text-white transition-all duration-200 ${
              params.workspaceId === workspace.id
                ? "bg-white text-[#3F0E40]"
                : "bg-[#4A154B] hover:bg-[#4C9689] hover:text-white"
            } hover:rounded-lg`}
          >
            {workspace.logo_url ? (
              <Image
                src={workspace.logo_url}
                alt={workspace.name}
                className="w-full h-full object-cover rounded"
                width={40}
                height={40}
              />
            ) : (
              workspace.name.charAt(0).toUpperCase()
            )}
          </Link>
        ))}

        {/* ナビゲーションアイコン */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#350D36] rounded transition-colors duration-150"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dms"
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#350D36] rounded transition-colors duration-150"
              >
                <MessageSquare className="h-[18px] w-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>DMs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/mentions"
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#350D36] rounded transition-colors duration-150"
              >
                <Bell className="h-[18px] w-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Mentions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#350D36] rounded transition-colors duration-150">
                <MoreVertical className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>More</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* ワークスペース追加ボタン */}
        <Link
          href="/workspace/create"
          className="mt-auto w-10 h-10 rounded flex items-center justify-center text-white bg-[#4A154B] hover:bg-[#4C9689] transition-all duration-200 hover:rounded-lg"
        >
          <Plus className="h-[18px] w-[18px]" />
        </Link>
      </div>

      {/* メインサイドバー - チャンネル一覧など */}
      <div className="w-60 flex flex-col h-full text-white bg-[#3F0E40] px-4">
        {/* ワークスペースヘッダー */}
        <div className="flex items-center justify-between py-4 hover:bg-[#350D36] cursor-pointer border-b border-[#522653] mb-4 -mx-4 px-4">
          <div className="flex items-center">
            <h2 className="font-bold text-white">
              {currentWorkspace?.name || "SlackClone"}
            </h2>
            <ChevronDown className="h-[18px] w-[18px] ml-2" />
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
                  <PlusCircle className="h-[18px] w-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 検索ボタン - Slackのジャンプボタン */}
        <button className="mb-4 flex items-center h-9 px-3 rounded border border-[#565856] text-[#BCABBC] text-sm hover:bg-[#350D36] hover:border-[#350D36] hover:text-white transition-colors duration-150">
          <Search className="h-[18px] w-[18px] mr-2" />
          <span>Search {currentWorkspace?.name}</span>
        </button>

        {/* プロモーション */}
        <div className="mb-4 bg-[#4A154B] rounded p-3 text-sm">
          <div className="flex items-center">
            <PlusCircle className="h-[18px] w-[18px] mr-2" />
            <span className="font-medium">Get 50% Off Slack</span>
          </div>
          <div className="text-xs text-[#BCABBC] mt-1">
            1 day left on this offer
          </div>
        </div>

        {/* Slackのメインナビゲーション - ThreadsとHuddles */}
        <div className="space-y-2 mb-4">
          <Link
            href="/threads"
            className="flex items-center py-2 px-2 rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
          >
            <MessageCircle className="h-[18px] w-[18px] mr-2" />
            <span className="text-sm">Threads</span>
          </Link>
          <Link
            href="/huddles"
            className="flex items-center py-2 px-2 rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
          >
            <Headphones className="h-[18px] w-[18px] mr-2" />
            <span className="text-sm">Huddles</span>
          </Link>
        </div>

        {/* チャンネルセクション */}
        <div className="flex-1 overflow-y-auto hide-scrollbar hover-scrollbar">
          <Collapsible
            open={channelsOpen}
            onOpenChange={toggleChannels}
            className="mb-4"
          >
            <div className="flex items-center justify-between py-2 group">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium uppercase text-[#BCABBC] group-hover:text-white transition-colors duration-150">
                  <ChevronDown
                    className={`h-[18px] w-[18px] mr-1 transition-transform duration-200 ${
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
                    className="h-6 w-6 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white transition-colors duration-150"
                  >
                    <Plus className="h-[18px] w-[18px]" />
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

            <CollapsibleContent className="space-y-1 mt-1">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={
                      params.workspaceId
                        ? `/workspace/${params.workspaceId}/channel/${channel.id}`
                        : `/channel/${channel.id}`
                    }
                    className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
                  >
                    <Hash className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
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
                    className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
                  >
                    <Hash className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
                    <span>general</span>
                  </Link>
                  <Link
                    href={
                      params.workspaceId
                        ? `/workspace/${params.workspaceId}/channel/random`
                        : "/channel/random"
                    }
                    className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
                  >
                    <Hash className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
                    <span>random</span>
                  </Link>
                </>
              )}
              <Link
                href="#"
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
                <span>Add channels</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* DMsセクション */}
          <Collapsible open={dmsOpen} onOpenChange={toggleDMs} className="mb-4">
            <div className="flex items-center justify-between py-2 group">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium uppercase text-[#BCABBC] group-hover:text-white transition-colors duration-150">
                  <ChevronDown
                    className={`h-[18px] w-[18px] mr-1 transition-transform duration-200 ${
                      dmsOpen ? "" : "transform -rotate-90"
                    }`}
                  />
                  <span>Direct Messages</span>
                </button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </div>

            <CollapsibleContent className="space-y-1 mt-1">
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/dm/slackbot`
                    : "/dm/slackbot"
                }
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <span className="w-[18px] h-[18px] bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                <span>Slackbot</span>
              </Link>
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/dm/you`
                    : "/dm/you"
                }
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <span className="w-[18px] h-[18px] bg-yellow-500 rounded-full mr-2 flex-shrink-0"></span>
                <span>you</span>
              </Link>
              <Link
                href="#"
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
                <span>Add coworkers</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Appsセクション */}
          <Collapsible
            open={appsOpen}
            onOpenChange={toggleApps}
            className="mb-4"
          >
            <div className="flex items-center justify-between py-2 group">
              <CollapsibleTrigger asChild>
                <button className="flex items-center text-xs font-medium uppercase text-[#BCABBC] group-hover:text-white transition-colors duration-150">
                  <ChevronDown
                    className={`h-[18px] w-[18px] mr-1 transition-transform duration-200 ${
                      appsOpen ? "" : "transform -rotate-90"
                    }`}
                  />
                  <span>Apps</span>
                </button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </div>

            <CollapsibleContent className="space-y-1 mt-1">
              <Link
                href={
                  params.workspaceId
                    ? `/workspace/${params.workspaceId}/app/slackbot`
                    : "/app/slackbot"
                }
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <span className="w-[18px] h-[18px] bg-purple-500 rounded-full mr-2 flex-shrink-0"></span>
                <span>Slackbot</span>
              </Link>
              <Link
                href="#"
                className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-[18px] w-[18px] mr-2 text-[#BCABBC]" />
                <span>Add apps</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
