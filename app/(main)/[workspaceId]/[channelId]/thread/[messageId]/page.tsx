import { notFound, redirect } from "next/navigation";
import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { getChannelById } from "@/lib/actions/channel-actions";
import { getCurrentUser } from "@/lib/auth";
import { ThreadView } from "@/components/threads/thread-view";

export default async function ThreadPage({
  params,
}: {
  params: { workspaceId: string; channelId: string; messageId: string };
}) {
  const { workspaceId, channelId, messageId } = params;

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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-md shadow">
      <ThreadView
        messageId={messageId}
        channelId={channelId}
        workspaceId={workspaceId}
      />
    </div>
  );
}
