import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import { FileBrowser } from "@/components/files/file-browser";
import { FileText } from "lucide-react";

export default async function ChannelFilesPage({
  params,
}: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) {
  const { workspaceId, channelId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/");
  }

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.authId, user.id),
  });

  if (!dbUser) {
    redirect("/auth?next=/");
  }

  // Fetch channel to verify it exists and user has access
  const channel = await db.query.channels.findFirst({
    where: (channels, { eq }) => eq(channels.id, channelId),
    with: {
      workspace: true,
    },
  });

  if (!channel || channel.workspace.id !== workspaceId) {
    redirect(`/${workspaceId}`);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Files in #{channel.name}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse all files shared in this channel
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar hover-scrollbar">
        <FileBrowser workspaceId={workspaceId} channelId={channelId} />
      </div>
    </div>
  );
}
