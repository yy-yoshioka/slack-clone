"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  profiles?: {
    avatar_url: string | null;
    full_name: string | null;
    email: string;
  };
}

interface MessageListProps {
  channelId: string;
}

export default function MessageList({ channelId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            profiles (
              avatar_url,
              full_name,
              email
            )
          `
          )
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data as Message[]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          // Add user profile info
          supabase
            .from("profiles")
            .select("avatar_url, full_name, email")
            .eq("id", payload.new.user_id)
            .single()
            .then(({ data }) => {
              const newMessage = {
                ...payload.new,
                profiles: data,
              } as Message;

              setMessages((current) => [...current, newMessage]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="inline-flex p-4 rounded-full bg-gray-100">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-3 text-lg font-medium">No messages yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to send a message!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {messages.map((message) => {
        const profile = message.profiles;
        const date = new Date(message.created_at);
        const formattedTime = date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        const formattedDate = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div key={message.id} className="group">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {(
                    profile?.full_name?.[0] ||
                    profile?.email?.[0] ||
                    "?"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-baseline">
                  <h4 className="font-medium text-gray-900">
                    {profile?.full_name || profile?.email || "Unknown user"}
                  </h4>
                  <span className="ml-2 text-xs text-gray-500">
                    {formattedTime} | {formattedDate}
                  </span>
                </div>

                <div className="mt-1 text-gray-800">{message.content}</div>

                <div className="mt-2 hidden group-hover:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">React</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-gray-500 hover:text-gray-700"
                  >
                    <Reply className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
