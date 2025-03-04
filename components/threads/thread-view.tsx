import {
  getThreadReplies,
  getThreadParentMessage,
} from "@/lib/actions/thread-actions";
import { MessageItem } from "@/components/messages/message-item";
import { ThreadReply } from "@/components/threads/thread-reply";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function ThreadView({
  messageId,
  channelId,
  workspaceId,
}: {
  messageId: string;
  channelId: string;
  workspaceId: string;
}) {
  const parentMessage = await getThreadParentMessage(messageId);
  const replies = await getThreadReplies(messageId);
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

  if (!parentMessage) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-medium">Thread not found</h3>
          <p className="text-sm text-gray-500 mt-1">
            The message you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2">
          <Link
            href={`/${workspaceId}/${channelId}`}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold">Thread</h2>
            <p className="text-sm text-gray-500">
              Replies to a message in{" "}
              <span className="font-medium">#{channelId}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-b py-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="px-4">
          <MessageItem
            id={parentMessage.id}
            content={parentMessage.content}
            createdAt={parentMessage.createdAt}
            user={parentMessage.user}
            isEdited={parentMessage.isEdited}
            isPinned={parentMessage.isPinned}
            isThreadParent={true}
            workspaceId={workspaceId}
            channelId={channelId}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        {replies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No replies yet. Be the first to reply to this thread.
          </div>
        ) : (
          <div className="flex flex-col-reverse">
            {replies.map((reply) => (
              <MessageItem
                key={reply.id}
                id={reply.id}
                content={reply.content}
                createdAt={reply.createdAt}
                user={reply.user}
                isEdited={reply.isEdited}
                isPinned={reply.isPinned}
                isThreadParent={false}
                workspaceId={workspaceId}
                channelId={channelId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t">
        <ThreadReply channelId={channelId} parentMessageId={messageId} />
      </div>
    </div>
  );
}
