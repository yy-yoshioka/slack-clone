"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { getMessagesInChannel } from "@/lib/actions/message-actions";
import { useRealtimeMessages } from "@/lib/hooks/use-realtime-messages";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageSearch } from "@/components/messages/message-search";

interface MessageListProps {
  channelId: string;
  workspaceId: string;
  userId: string;
}

export function MessageList({
  channelId,
  workspaceId,
  userId,
}: MessageListProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Load messages and subscribe to realtime updates
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await getMessagesInChannel(channelId);
        if (response.success) {
          setMessages(response.messages);
          setFilteredMessages(response.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Set up realtime subscription for new messages
  const { messages: realtimeMessages } = useRealtimeMessages(channelId);

  // Scroll to bottom on initial load or when new messages arrive
  useEffect(() => {
    if (!isLoading && !searchQuery) {
      scrollToBottom();
    }
  }, [filteredMessages.length, isLoading, searchQuery]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = useCallback(
    (query: string, messageList = messages) => {
      setSearchQuery(query);
      setIsSearching(true);

      if (!query.trim()) {
        setFilteredMessages(messageList);
        setIsSearching(false);
        return;
      }

      const lowercaseQuery = query.toLowerCase();
      const filtered = messageList.filter((msg) =>
        msg.content.toLowerCase().includes(lowercaseQuery)
      );

      setFilteredMessages(filtered);
      setIsSearching(false);
    },
    [messages]
  );
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setMessages(realtimeMessages);
      if (!searchQuery) {
        setFilteredMessages(realtimeMessages);
      } else {
        // Maintain search filtering when new messages arrive
        handleSearch(searchQuery, realtimeMessages);
      }
    }
  }, [realtimeMessages, searchQuery, handleSearch]);

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-2 border-b flex justify-end">
        <MessageSearch
          channelId={channelId}
          onSearch={handleSearch}
          onNavigate={scrollToMessage}
          matchCount={searchQuery ? filteredMessages.length : 0}
          isSearching={isSearching}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-10">
            {searchQuery ? (
              <p className="text-muted-foreground">
                No messages matching "{searchQuery}"
              </p>
            ) : (
              <p className="text-muted-foreground">
                No messages in this channel yet. Start the conversation!
              </p>
            )}
          </div>
        ) : (
          <>
            {filteredMessages.map((message, index) => {
              const previousMessage =
                index > 0 ? filteredMessages[index - 1] : null;
              const showHeader =
                !previousMessage ||
                previousMessage.userId !== message.userId ||
                new Date(message.createdAt).getTime() -
                  new Date(previousMessage.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  workspaceId={workspaceId}
                  channelId={channelId}
                  currentUserId={userId || ""}
                  showHeader={showHeader}
                  highlightText={searchQuery}
                  id={`message-${message.id}`}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
