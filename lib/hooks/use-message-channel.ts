import { useEffect, useState } from "react";
import { useChannel } from "ably/react";

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
    publishMessage: (data: any) => channel.publish("message.new", data),
    updateMessage: (data: any) => channel.publish("message.update", data),
    deleteMessage: (data: any) => channel.publish("message.delete", data),
  };
}
