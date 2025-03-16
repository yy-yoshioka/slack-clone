"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMessages } from "@/lib/actions/message-actions";
import { Message } from "../../types/message";

export function useRealtimeMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async () => {
          const updatedMessages = await getMessages(channelId);
          setMessages(updatedMessages);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return { messages };
}
