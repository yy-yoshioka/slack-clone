"use server";

import { db } from "@/db/db";
import { messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql, count } from "drizzle-orm";

export type MessageFormValues = {
  content: string;
};

export async function createMessage(
  channelId: string,
  data: MessageFormValues
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to send a message");
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    // Create the message
    const [message] = await db
      .insert(messages)
      .values({
        content: data.content,
        channelId,
        userId: dbUser.id,
      })
      .returning();

    revalidatePath(`/${message.channelId}`);
    return { success: true, messageId: message.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function getMessages(channelId: string) {
  try {
    // First, get all top-level messages
    const channelMessages = await db.query.messages.findMany({
      where: (messages, { eq, isNull }) =>
        and(
          eq(messages.channelId, channelId),
          isNull(messages.parentMessageId) // Only get top-level messages, not replies
        ),
      orderBy: [desc(messages.createdAt)],
      with: {
        user: true,
      },
    });

    // Then, for each message, count its replies separately
    const messagesWithCounts = await Promise.all(
      channelMessages.map(async (message) => {
        // Count replies for this message
        const replyCount = await db
          .select({ count: count() })
          .from(messages)
          .where(eq(messages.parentMessageId, message.id))
          .then((result) => result[0].count);

        return {
          ...message,
          replyCount,
        };
      })
    );

    return messagesWithCounts;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

export async function pinMessage(messageId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to pin a message");
    }

    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, messageId),
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Toggle the pinned status
    const [updatedMessage] = await db
      .update(messages)
      .set({ isPinned: !message.isPinned })
      .where(eq(messages.id, messageId))
      .returning();

    revalidatePath(`/${message.channelId}`);
    return { success: true, isPinned: updatedMessage.isPinned };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pin message",
    };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to delete a message");
    }

    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, messageId),
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Only allow the author to delete their message
    if (message.userId !== dbUser.id) {
      throw new Error("You can only delete your own messages");
    }

    await db.delete(messages).where(eq(messages.id, messageId));

    revalidatePath(`/${message.channelId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

export async function editMessage(messageId: string, data: MessageFormValues) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to edit a message");
    }

    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, messageId),
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Only allow the author to edit their message
    if (message.userId !== dbUser.id) {
      throw new Error("You can only edit your own messages");
    }

    const [updatedMessage] = await db
      .update(messages)
      .set({ content: data.content, isEdited: true })
      .where(eq(messages.id, messageId))
      .returning();

    revalidatePath(`/${message.channelId}`);
    return { success: true, messageId: updatedMessage.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit message",
    };
  }
}

export async function getMessageReplyCount(messageId: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.parentMessageId, messageId));

    return result[0].count;
  } catch (error) {
    console.error("Failed to get message reply count:", error);
    return 0;
  }
}
