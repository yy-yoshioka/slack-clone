import { getAblyClient } from "./ably";
import { Message } from "../types/message";

type MessageEventType = "message.new" | "message.update" | "message.delete";

export async function publishMessageEvent(
  eventType: MessageEventType,
  data: Message
) {
  try {
    const ably = getAblyClient();
    const channel = ably.channels.get("messages");
    await channel.publish(eventType, data);
    return true;
  } catch (error) {
    console.error(`Failed to publish ${eventType} event:`, error);
    return false;
  }
}
