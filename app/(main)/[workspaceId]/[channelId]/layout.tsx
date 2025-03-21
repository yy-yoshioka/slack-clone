import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import { ChannelTabs } from "@/components/channels/channel-tabs";

interface ChannelLayoutProps {
  params: {
    workspaceId: string;
    channelId: string;
  };
  children: React.ReactNode;
}

export default async function ChannelLayout({
  params,
  children,
}: ChannelLayoutProps) {
  const { workspaceId, channelId } = await Promise.resolve(params);

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

  // Fetch channel and verify it exists
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
      <ChannelTabs
        workspaceId={workspaceId}
        channelId={channelId}
        channelName={channel.name}
      />
      {children}
    </div>
  );
}
