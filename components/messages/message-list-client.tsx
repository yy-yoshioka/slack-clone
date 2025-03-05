"use client";

import { useEffect, useState } from "react";
import { MessageItem } from "@/components/messages/message-item";
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

  // Get the Ably channel
  const { channel } = useChannel("messages");

  useEffect(() => {
    // Update messages when initialMessages changes
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Handle new message creation
    const handleNewMessage = (message: any) => {
      const newMessage = message.data;
      if (newMessage.channelId === channelId) {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      }
    };

    // Handle message updates
    const handleMessageUpdate = (message: any) => {
      const updatedMessage = message.data;
      if (updatedMessage.channelId === channelId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
          )
        );
      }
    };

    // Handle message deletion
    const handleMessageDelete = (message: any) => {
      const { messageId } = message.data;
      if (message.data.channelId === channelId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      }
    };

    // Subscribe to all message events
    channel.subscribe("message.new", handleNewMessage);
    channel.subscribe("message.update", handleMessageUpdate);
    channel.subscribe("message.delete", handleMessageDelete);

    // Don't forget to unsubscribe when component unmounts
    return () => {
      channel.unsubscribe("message.new", handleNewMessage);
      channel.unsubscribe("message.update", handleMessageUpdate);
      channel.unsubscribe("message.delete", handleMessageDelete);
    };
  }, [channel, channelId, messages]);

  // Keep the existing reaction handling code
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
