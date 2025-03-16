"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { getMessagesInChannel } from "@/lib/actions/message-actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageSearch } from "@/components/messages/message-search";
import { useChannel } from "ably/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../../types/message";

interface MessageListProps {
  channelId: string;
  workspaceId: string;
  userId: string;
}

interface MessageData {
  id: string;
  content: string;
  userId: string;
  // Add other message properties as needed
}

export function MessageList({
  channelId,
  workspaceId,
  userId,
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);

  // メッセージを取得する関数
  const fetchMessages = useCallback(async () => {
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
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setIsLoading(false);
  }, [channelId]);

  // 初回ロードとチャンネル変更時にメッセージを取得
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Ablyのサブスクリプション設定
  const { channel } = useChannel("messages");

  useEffect(() => {
    // 新規メッセージの処理
    const handleNewMessage = (message: MessageData) => {
      if (message.data.channelId === channelId) {
        setMessages((prev) => [...prev, message.data]);
        setFilteredMessages((prev) => [...prev, message.data]);
        scrollToBottom();
      }
    };

    // メッセージ更新の処理
    const handleMessageUpdate = (updatedMessage: MessageData) => {
      if (updatedMessage.data.channelId === channelId) {
        const newMessages = messages.map((msg) =>
          msg.id === updatedMessage.data.id ? updatedMessage.data : msg
        );
        setMessages(newMessages);
        setFilteredMessages(newMessages); // フィルタリングされたメッセージも更新
      }
    };

    // メッセージ削除の処理
    const handleDelete = (messageId: string) => {
      if (messageId === channelId) {
        const filterMessages = messages.filter((msg) => msg.id !== messageId);
        setMessages(filterMessages);
        setFilteredMessages(filterMessages);
      }
    };

    // イベントの購読
    channel.subscribe("message.new", handleNewMessage);
    channel.subscribe("message.update", handleMessageUpdate);
    channel.subscribe("message.delete", handleDelete);

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, channel, messages]);

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

  const loadMoreMessages = async () => {
    setIsLoadingEarlier(true);
    try {
      const response = await getMessagesInChannel(channelId, {
        direction: "backwards",
        limit: 10,
      });
      if (response.success && response.messages) {
        setMessages((prev) => [...prev, ...response.messages]);
        setFilteredMessages((prev) => [...prev, ...response.messages]);
        setHasMore(response.hasMore);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
    setIsLoadingEarlier(false);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {isLoadingEarlier && (
        <div className="flex justify-center items-center py-2 bg-slate-100/10">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      )}
      <div className="px-4 py-2 border-b flex justify-end">
        <MessageSearch
          onSearch={handleSearch}
          setIsSearching={setIsSearching}
          isSearching={isSearching}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar hover-scrollbar">
        {hasMore && !isLoadingEarlier && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreMessages}
              className="text-xs"
            >
              Load earlier messages
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {isSearching ? (
                <p className="text-muted-foreground">No messages found</p>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to send a message!
                  </p>
                </div>
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
    </div>
  );
}
