import { notFound, redirect } from "next/navigation";
import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { getChannelById } from "@/lib/actions/channel-actions";
import { getCurrentUser } from "@/lib/auth";

export default async function ChannelPage({
  params,
}: {
  params: { workspaceId: string; channelId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const workspace = await getWorkspaceById(params.workspaceId);

  if (!workspace) {
    notFound();
  }

  const channel = await getChannelById(params.channelId);

  if (!channel || channel.workspaceId !== params.workspaceId) {
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

      <div className="flex-1 overflow-y-auto py-4">
        {/* Messages will be displayed here */}
        <div className="text-center py-8 text-gray-500">
          This is the beginning of the #{channel.name} channel
        </div>
      </div>

      <div className="border-t pt-4">
        {/* Message input will go here */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
          <p className="text-gray-500 text-sm">Message input coming soon...</p>
        </div>
      </div>
    </div>
  );
}
