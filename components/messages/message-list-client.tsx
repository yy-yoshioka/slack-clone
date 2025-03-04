"use client";

import { useEffect, useState } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { MessageThreadObserver } from "@/components/messages/message-thread-observer";
import { getMessageReplyCount } from "@/lib/actions/message-actions";
import { useChannel } from "ably/react";

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
  reactionsLastUpdated?: number;
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

  const { channel } = useChannel("reactions");

  useEffect(() => {
    // Update messages when initialMessages changes
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const handleReactionUpdate = async (message: any) => {
      const { messageId } = message.data;
      // Find the message and update its reactions
      const updatedMessages = [...messages];
      const messageIndex = updatedMessages.findIndex((m) => m.id === messageId);

      if (messageIndex !== -1) {
        // Trigger the message component to refresh its reactions
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          reactionsLastUpdated: Date.now(), // Add this timestamp to force refresh
        };
        setMessages(updatedMessages);
      }
    };

    channel.subscribe("reaction.update", handleReactionUpdate);

    return () => {
      channel.unsubscribe("reaction.update", handleReactionUpdate);
    };
  }, [messages, channel]);

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
