"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { MessageItem } from "@/components/messages/message-item";
import { getMessagesInChannel } from "@/lib/actions/message-actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageSearch } from "@/components/messages/message-search";
import { useChannel } from "ably/react";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../../types/message";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { EmptyChannel } from "@/components/channels/empty-channel";

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(
    null
  );

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

    // Set up tracking of the last read message
    const storedLastReadId = localStorage.getItem(`lastRead_${channelId}`);
    if (storedLastReadId) {
      setLastReadMessageId(storedLastReadId);
    }
  }, [fetchMessages, channelId]);

  // Ablyのサブスクリプション設定
  const { channel } = useChannel("messages");

  useEffect(() => {
    // 新規メッセージの処理
    const handleNewMessage = (message: MessageData) => {
      if (message.data.channelId === channelId) {
        setMessages((prev) => [...prev, message.data]);
        setFilteredMessages((prev) => [...prev, message.data]);

        // Show new message indicator if user has scrolled up
        if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            messagesContainerRef.current;
          const isScrolledToBottom =
            scrollHeight - scrollTop - clientHeight < 100;

          if (!isScrolledToBottom) {
            setHasNewMessages(true);
          } else {
            scrollToBottom();
            // Update last read message
            if (message.data.id) {
              localStorage.setItem(`lastRead_${channelId}`, message.data.id);
              setLastReadMessageId(message.data.id);
            }
          }
        }
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
      channel.unsubscribe("message.new", handleNewMessage);
      channel.unsubscribe("message.update", handleMessageUpdate);
      channel.unsubscribe("message.delete", handleDelete);
    };
  }, [channel, channelId, messages]);

  // Scroll to bottom and mark messages as read
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);

      // Update last read message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.id) {
        localStorage.setItem(`lastRead_${channelId}`, lastMessage.id);
        setLastReadMessageId(lastMessage.id);
      }
    }
  };

  // Handle scroll events to detect when user reaches top or bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isScrolledToBottom && hasNewMessages) {
        setHasNewMessages(false);

        // Update last read message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.id) {
          localStorage.setItem(`lastRead_${channelId}`, lastMessage.id);
          setLastReadMessageId(lastMessage.id);
        }
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasNewMessages, messages, channelId]);

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

  // Helper function to format date for separators
  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  // Group messages by date for date separators
  const messageGroups = filteredMessages.reduce<
    {
      date: string;
      messages: Message[];
    }[]
  >((groups, message) => {
    const messageDate = new Date(message.createdAt);
    const dateStr = formatMessageDate(messageDate);

    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        date: dateStr,
        messages: [message],
      });
    }

    return groups;
  }, []);

  // Determine if we need to show a new message divider
  const getNewMessageIndex = () => {
    if (!lastReadMessageId) return -1;

    for (let i = 0; i < filteredMessages.length; i++) {
      if (filteredMessages[i].id === lastReadMessageId) {
        return i + 1 < filteredMessages.length ? i + 1 : -1;
      }
    }

    return -1;
  };

  const newMessageIndex = getNewMessageIndex();

  // Group messages by sender and time for better spacing
  const getGroupedMessages = (messages: Message[]) => {
    return messages.reduce<{
      groupedMessages: Message[][];
      currentGroup: Message[];
    }>(
      (acc, message, index) => {
        const prevMessage = messages[index - 1];

        // Start a new group if:
        // 1. This is first message
        // 2. Different sender
        // 3. More than 5 minutes between messages
        // 4. This message is on the other side of the "new messages" indicator
        if (
          !prevMessage ||
          prevMessage.userId !== message.userId ||
          new Date(message.createdAt).getTime() -
            new Date(prevMessage.createdAt).getTime() >
            5 * 60 * 1000 ||
          (newMessageIndex > 0 && index === newMessageIndex)
        ) {
          if (acc.currentGroup.length > 0) {
            acc.groupedMessages.push([...acc.currentGroup]);
            acc.currentGroup = [message];
          } else {
            acc.currentGroup.push(message);
          }
        } else {
          acc.currentGroup.push(message);
        }

        // If this is the last message, add the current group
        if (index === messages.length - 1 && acc.currentGroup.length > 0) {
          acc.groupedMessages.push([...acc.currentGroup]);
        }

        return acc;
      },
      { groupedMessages: [], currentGroup: [] }
    ).groupedMessages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoading && filteredMessages.length === 0) {
    return (
      <EmptyChannel
        channelName={channelId}
        onStartTopic={(topic) => {
          // Handle starting a conversation with the selected topic
          console.log("Starting topic:", topic);
        }}
      />
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 z-10">
        <MessageSearch
          onSearch={(query) => {
            setSearchQuery(query);
            setIsSearching(true);
            // Implement search functionality
          }}
        />
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pt-20 pb-2 px-4"
      >
        {hasMore && (
          <div className="flex justify-center my-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreMessages}
              disabled={isLoadingEarlier}
              className="flex items-center gap-2"
            >
              {isLoadingEarlier ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load earlier messages</span>
              )}
            </Button>
          </div>
        )}

        {messageGroups.map((group, groupIndex) => (
          <Fragment key={group.date}>
            <div className="flex items-center justify-center my-6">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300">
                {group.date}
              </div>
            </div>

            {getGroupedMessages(group.messages).map(
              (messageGroup, messageGroupIndex) => (
                <Fragment key={`${groupIndex}-${messageGroupIndex}`}>
                  {messageGroup.map((message, index) => {
                    const isFirstInGroup = index === 0;
                    const isNewMessageDivider =
                      newMessageIndex > 0 &&
                      filteredMessages.indexOf(message) === newMessageIndex;

                    return (
                      <Fragment key={message.id}>
                        {isNewMessageDivider && (
                          <div className="flex items-center my-6">
                            <div className="flex-grow h-px bg-red-300 dark:bg-red-700" />
                            <div className="mx-4 px-3 py-1 bg-red-100 dark:bg-red-900 rounded-full text-sm text-red-600 dark:text-red-300">
                              New Messages
                            </div>
                            <div className="flex-grow h-px bg-red-300 dark:bg-red-700" />
                          </div>
                        )}

                        <MessageItem
                          key={message.id}
                          message={message}
                          isFirstInGroup={isFirstInGroup}
                          showAvatar={isFirstInGroup}
                          showTimestamp={index === messageGroup.length - 1}
                          currentUserId={userId}
                        />
                      </Fragment>
                    );
                  })}
                  <div className="mb-4"></div>{" "}
                  {/* Space between message groups */}
                </Fragment>
              )
            )}
          </Fragment>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {hasNewMessages && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 flex items-center gap-1"
          size="sm"
        >
          <ChevronDown className="h-4 w-4" />
          <span>New messages</span>
        </Button>
      )}
    </div>
  );
}
