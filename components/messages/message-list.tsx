"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { getMessagesInChannel } from "@/lib/actions/message-actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageSearch } from "@/components/messages/message-search";
import { useChannel } from "ably/react";

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

  // メッセージを取得する関数
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await getMessagesInChannel(channelId);
      if (response.success && response.messages) {
        // メッセージを日付の昇順（古い順）にソート
        const sortedMessages = response.messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        setFilteredMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setIsLoading(false);
  };

  // 初回ロードとチャンネル変更時にメッセージを取得
  useEffect(() => {
    fetchMessages();
  }, [channelId]);

  // Ablyのサブスクリプション設定
  const { channel } = useChannel("messages");

  useEffect(() => {
    // 新規メッセージの処理
    const handleNewMessage = (message: any) => {
      if (message.data.channelId === channelId) {
        setMessages((prev) => [...prev, message.data]);
        setFilteredMessages((prev) => [...prev, message.data]);
        scrollToBottom();
      }
    };

    // メッセージ更新の処理
    const handleMessageUpdate = (message: any) => {
      if (message.data.channelId === channelId) {
        const updatedMessage = message.data;
        setMessages((prev) => {
          const newMessages = prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          );
          setFilteredMessages(newMessages); // フィルタリングされたメッセージも更新
          return newMessages;
        });
      }
    };

    // メッセージ削除の処理
    const handleMessageDelete = (message: any) => {
      if (message.data.channelId === channelId) {
        const { messageId } = message.data;
        const filterMessages = (prev: any[]) =>
          prev.filter((msg) => msg.id !== messageId);
        setMessages(filterMessages);
        setFilteredMessages(filterMessages);
      }
    };

    // イベントの購読
    channel.subscribe("message.new", handleNewMessage);
    channel.subscribe("message.update", handleMessageUpdate);
    channel.subscribe("message.delete", handleMessageDelete);

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, channel]);

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
          <div className="flex flex-col space-y-4">
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
                  id={message.id}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
