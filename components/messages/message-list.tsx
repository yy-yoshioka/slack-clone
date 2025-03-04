import { getMessages } from "@/lib/actions/message-actions";
import { MessageListClient } from "@/components/messages/message-list-client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";

export async function MessageList({
  channelId,
  workspaceId,
}: {
  channelId: string;
  workspaceId: string;
}) {
  const messages = await getMessages(channelId);
  const user = await getCurrentUser();

  // Get the DB user ID for the current user
  let currentUserId = "";
  if (user) {
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });
    if (dbUser) {
      currentUserId = dbUser.id;
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-medium">No messages yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Be the first one to send a message to this channel!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <MessageListClient
        initialMessages={messages}
        channelId={channelId}
        workspaceId={workspaceId}
        currentUserId={currentUserId}
      />
    </div>
  );
}
