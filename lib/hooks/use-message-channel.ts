import { useEffect, useState } from "react";
import { useChannel } from "ably/react";

interface MessageData {
  id: string;
  content: string;
  userId: string;
  timestamp: string | Date;
  attachments?: MessageAttachment[];
  reactions?: Reaction[];
  // Add other properties
}

export function useMessageChannel(channelId: string) {
  const { channel } = useChannel("messages");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set up connection status monitoring
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    channel.presence.subscribe("enter", handleConnected);
    channel.presence.subscribe("leave", handleDisconnected);

    // Enter the channel presence
    channel.presence.enter({ channelId });

    return () => {
      channel.presence.unsubscribe("enter", handleConnected);
      channel.presence.unsubscribe("leave", handleDisconnected);
      channel.presence.leave();
    };
  }, [channel, channelId]);

  return {
    channel,
    isConnected,
    publishMessage: (data: MessageData) => channel.publish("message.new", data),
    updateMessage: (data: MessageData) =>
      channel.publish("message.update", data),
    deleteMessage: (data: MessageData) =>
      channel.publish("message.delete", data),
  };
}
