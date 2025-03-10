"use server";

import { db } from "@/db/db";
import { messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export type ThreadReplyFormValues = {
  content: string;
};

export async function createThreadReply(
  channelId: string,
  parentMessageId: string,
  data: ThreadReplyFormValues
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to reply to a thread");
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    // Mark the parent message as a thread parent if it's not already
    await db
      .update(messages)
      .set({ isThreadParent: true })
      .where(eq(messages.id, parentMessageId));

    // Create the reply message
    const [reply] = await db
      .insert(messages)
      .values({
        content: data.content,
        channelId,
        userId: dbUser.id,
        parentMessageId,
      })
      .returning();

    revalidatePath(`/${channelId}`);
    revalidatePath(`/${channelId}/thread/${parentMessageId}`);
    return { success: true, replyId: reply.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send reply",
    };
  }
}

export async function getThreadReplies(parentMessageId: string) {
  try {
    // First check if parentMessageId exists in the database
    const parent = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, parentMessageId),
    });

    if (!parent) {
      return []; // Parent message doesn't exist
    }

    // Now query for replies where parentMessageId matches
    const replies = await db.query.messages.findMany({
      where: (messages, { eq }) =>
        eq(messages.parentMessageId, parentMessageId),
      orderBy: [desc(messages.createdAt)],
      with: {
        user: true,
      },
    });

    return replies;
  } catch (error) {
    console.error("Failed to fetch thread replies:", error);
    return [];
  }
}

export async function getThreadParentMessage(messageId: string) {
  try {
    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, messageId),
      with: {
        user: true,
      },
    });

    return message;
  } catch (error) {
    console.error("Failed to fetch parent message:", error);
    return null;
  }
}
