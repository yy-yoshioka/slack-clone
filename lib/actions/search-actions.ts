"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import { or } from "drizzle-orm";
import { channels } from "@/db/schema";

// Search across messages, channels, and files
export async function searchWorkspace(workspaceId: string, query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        messages: [],
        channels: [],
        files: [],
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
        messages: [],
        channels: [],
        files: [],
      };
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      return {
        success: false,
        error: "User not found",
        messages: [],
        channels: [],
        files: [],
      };
    }

    // Search messages
    const searchMessages = await db.query.messages.findMany({
      where: (messages, { and, ilike, eq, inArray }) => {
        // Get list of channel IDs in this workspace
        const subquery = and(
          ilike(messages.content, `%${query}%`),
          inArray(
            messages.channelId,
            db
              .select({ id: channels.id })
              .from(channels)
              .where(eq(channels.workspaceId, workspaceId))
          )
        );
        return subquery;
      },
      with: {
        channel: true,
        user: true,
      },
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      limit: 20,
    });

    // Search channels
    const searchChannels = await db.query.channels.findMany({
      where: (channels, { and, ilike, eq }) =>
        and(
          eq(channels.workspaceId, workspaceId),
          or(
            ilike(channels.name, `%${query}%`),
            ilike(channels.description || "", `%${query}%`)
          )
        ),
      orderBy: (channels, { asc }) => [asc(channels.name)],
      limit: 10,
    });

    // Search files
    const searchFiles = await db.query.files.findMany({
      where: (files, { ilike }) => ilike(files.name, `%${query}%`),
      with: {
        message: {
          with: {
            channel: {
              where: (channel, { eq }) => eq(channel.workspaceId, workspaceId),
            },
          },
        },
      },
      orderBy: (files, { desc }) => [desc(files.createdAt)],
      limit: 10,
    });

    // Filter out files that don't belong to this workspace
    const workspaceFiles = searchFiles.filter((file) => file.message?.channel);

    return {
      success: true,
      messages: searchMessages,
      channels: searchChannels,
      files: workspaceFiles,
    };
  } catch (error) {
    console.error("Error searching workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during search",
      messages: [],
      channels: [],
      files: [],
    };
  }
}
