import { notFound, redirect } from "next/navigation";
import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { getChannelById } from "@/lib/actions/channel-actions";
import { getCurrentUser } from "@/lib/auth";
import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";

export default async function ChannelPage({
  params,
}: {
  params: { workspaceId: string; channelId: string };
}) {
  const { workspaceId, channelId } = params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const [workspace, channel] = await Promise.all([
    getWorkspaceById(workspaceId),
    getChannelById(channelId),
  ]);

  if (!workspace) {
    notFound();
  }

  if (!channel || channel.workspaceId !== workspaceId) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold">#{channel.name}</h1>
        {channel.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {channel.description}
          </p>
        )}
      </div>

      <MessageList channelId={channelId} workspaceId={workspaceId} />

      <div className="border-t pt-4">
        <MessageInput channelId={channelId} workspaceId={workspaceId} />
      </div>
    </div>
  );
}
