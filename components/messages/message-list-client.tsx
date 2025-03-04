"use client";

import { useEffect, useState } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { MessageThreadObserver } from "@/components/messages/message-thread-observer";
import { getMessageReplyCount } from "@/lib/actions/message-actions";

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  isEdited: boolean;
  isPinned: boolean;
  isThreadParent: boolean;
  replyCount?: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  parentMessageId?: string;
};

type MessageListClientProps = {
  initialMessages: Message[];
  channelId: string;
  workspaceId: string;
  currentUserId: string;
};

export function MessageListClient({
  initialMessages,
  channelId,
  workspaceId,
  currentUserId,
}: MessageListClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    // Update messages when initialMessages changes
    setMessages(initialMessages);
  }, [initialMessages]);

  return (
    <div className="flex flex-col-reverse">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          id={message.id}
          content={message.content}
          createdAt={message.createdAt}
          user={message.user}
          isEdited={message.isEdited}
          isPinned={message.isPinned}
          isThreadParent={message.isThreadParent}
          workspaceId={workspaceId}
          channelId={channelId}
          currentUserId={currentUserId}
          replyCount={message.replyCount}
          parentMessageId={message.parentMessageId}
        />
      ))}
    </div>
  );
}
