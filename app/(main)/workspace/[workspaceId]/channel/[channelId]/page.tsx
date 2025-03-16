import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  MessageSquare,
  BookOpen,
  Info,
  Users,
  Star,
  Link as LinkIcon,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "@/components/messaging/message-input";
import MessageList from "@/components/messaging/message-list";

interface ChannelPageProps {
  params: {
    workspaceId: string;
    channelId: string;
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Verify workspace membership
  const { data: workspaceMember } = await supabase
    .from("workspace_members")
    .select()
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!workspaceMember) {
    redirect("/");
  }

  // Get channel details
  const { data: channel } = await supabase
    .from("channels")
    .select("id, name, description, workspace_id, created_at")
    .eq("id", params.channelId)
    .eq("workspace_id", params.workspaceId)
    .single();

  if (!channel) {
    redirect(`/workspace/${params.workspaceId}`);
  }

  // Get channel members count
  const { count: membersCount } = await supabase
    .from("channel_members")
    .select("id", { count: "exact", head: true })
    .eq("channel_id", params.channelId);

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            {channel.name}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 ml-1 p-0 text-gray-500 hover:text-[#1264A3]"
          >
            <Star className="h-4 w-4" />
          </Button>

          <div className="h-5 border-l border-gray-300 mx-2 hidden md:block"></div>

          {membersCount && (
            <div className="hidden md:flex items-center text-sm text-gray-500 hover:text-[#1264A3] cursor-pointer">
              <Users className="h-4 w-4 mr-1" />
              <span>{membersCount}</span>
            </div>
          )}

          {channel.description && (
            <>
              <div className="h-5 border-l border-gray-300 mx-2 hidden md:block"></div>
              <div className="hidden md:block text-sm text-gray-500 truncate max-w-md">
                {channel.description}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 md:hidden"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Channel Description Banner */}
        {channel.description && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base font-medium mb-1">
              Everyone&apos;s all here in{" "}
              <span className="text-[#1264A3]">#{channel.name}</span>
            </h2>
            <p className="text-sm text-gray-600">{channel.description}</p>
          </div>
        )}

        {/* Channel Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Welcome Cards - Only show for new channels */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <div className="bg-[#1264A3] bg-opacity-10 text-[#1264A3] p-2 rounded-md mr-3">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Add company handbook</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Share helpful links, guidance, policies
                </p>
                <Button size="sm" variant="outline">
                  Add handbook
                </Button>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <div className="bg-[#1264A3] bg-opacity-10 text-[#1264A3] p-2 rounded-md mr-3">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Personalize a welcome message</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Record a short video clip
                </p>
                <Button size="sm" variant="outline">
                  Record video
                </Button>
              </div>
            </div>

            {/* Join Message */}
            <div className="py-4 mb-4 border-b border-gray-200">
              <div className="flex items-start">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-baseline mb-1">
                    <span className="font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date().toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    joined{" "}
                    <span className="text-[#1264A3]">#{channel.name}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actual Messages would be loaded here */}
          <div className="flex-1 overflow-y-auto px-4">
            <MessageList channelId={params.channelId} />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <MessageInput
              channelId={params.channelId}
              workspaceId={params.workspaceId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
