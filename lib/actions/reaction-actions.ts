"use server";

import { db } from "@/db/db";
import { reactions } from "@/db/schema/reactions";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getAblyClient } from "@/lib/ably";

export type EmojiReaction = {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
};

// Get all reactions for a message
export async function getMessageReactions(messageId: string) {
  try {
    const messageReactions = await db.query.reactions.findMany({
      where: (reactions, { eq }) => eq(reactions.messageId, messageId),
      with: {
        user: true,
      },
    });

    return messageReactions;
  } catch (error) {
    console.error("Failed to fetch reactions:", error);
    return [];
  }
}

// Toggle a reaction (add if doesn't exist, remove if it does)
export async function toggleReaction(messageId: string, emoji: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in to react to messages");
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    // Check if reaction already exists
    const existingReaction = await db.query.reactions.findFirst({
      where: (reactions, { eq, and }) =>
        and(
          eq(reactions.messageId, messageId),
          eq(reactions.userId, dbUser.id),
          eq(reactions.emoji, emoji)
        ),
    });

    if (existingReaction) {
      // Remove the reaction
      await db.delete(reactions).where(eq(reactions.id, existingReaction.id));
    } else {
      // Add new reaction
      await db.insert(reactions).values({
        emoji,
        messageId,
        userId: dbUser.id,
      });
    }

    // Get the channel info for the message
    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, messageId),
    });

    if (message?.channelId) {
      // Publish to Ably for real-time updates
      const ably = getAblyClient();
      const channel = ably.channels.get(`reactions:${message.channelId}`);
      await channel.publish("reaction.update", { messageId });
    }

    // Revalidate paths
    revalidatePath(`/[workspaceId]/[channelId]`);
    revalidatePath(`/[workspaceId]/[channelId]/thread/[messageId]`);

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle reaction",
    };
  }
}

// Get reaction counts by emoji
export async function getReactionCounts(messageId: string) {
  try {
    const allReactions = await getMessageReactions(messageId);

    // Group reactions by emoji and count them
    const reactionCounts = allReactions.reduce(
      (acc, reaction) => {
        const { emoji } = reaction;
        if (!acc[emoji]) {
          acc[emoji] = {
            count: 0,
            users: [],
            hasReacted: false,
          };
        }
        acc[emoji].count += 1;
        acc[emoji].users.push({
          id: reaction.userId,
          name: reaction.user.name,
          imageUrl: reaction.user.imageUrl,
        });

        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          users: Array<{
            id: string;
            name: string | null;
            imageUrl: string | null;
          }>;
          hasReacted: boolean;
        }
      >
    );

    return reactionCounts;
  } catch (error) {
    console.error("Failed to get reaction counts:", error);
    return {};
  }
}
