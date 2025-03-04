"use server";

import { db } from "@/db/db";
import { channels, channelMembers } from "@/db/schema/channels";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ChannelFormValues = {
  name: string;
  description?: string;
  isPrivate: boolean;
};

export async function createChannel(
  workspaceId: string,
  data: ChannelFormValues
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to create a channel");
    }

    // Check if the user is a member of the workspace
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    // Check if user is a member of the workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: (members, { eq, and }) =>
        and(
          eq(members.workspaceId, workspaceId),
          eq(members.userId, dbUser.id)
        ),
    });

    if (!membership) {
      throw new Error(
        "You must be a member of the workspace to create a channel"
      );
    }

    // Create the channel
    const [channel] = await db
      .insert(channels)
      .values({
        name: data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description || null,
        workspaceId,
        isPrivate: data.isPrivate,
      })
      .returning();

    // If it's a private channel, add the creator as a member
    if (data.isPrivate) {
      await db.insert(channelMembers).values({
        channelId: channel.id,
        userId: dbUser.id,
        role: "admin",
      });
    }

    revalidatePath(`/${workspaceId}`);
    return { success: true, channelId: channel.id };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create channel",
    };
  }
}

export async function getChannelsForWorkspace(workspaceId: string) {
  try {
    // Get public channels
    const publicChannels = await db.query.channels.findMany({
      where: (channels, { eq, and }) =>
        and(
          eq(channels.workspaceId, workspaceId),
          eq(channels.isPrivate, false)
        ),
      orderBy: (channels, { asc }) => [asc(channels.name)],
    });

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return publicChannels;
    }

    // Find the user ID from our database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      return publicChannels;
    }

    // Get private channels the user is a member of
    const privateChannels = await db.query.channelMembers.findMany({
      where: (members, { eq }) => eq(members.userId, dbUser.id),
      with: {
        channel: true,
      },
    });

    const userPrivateChannels = privateChannels
      .map((membership) => membership.channel)
      .filter(
        (channel) => channel.workspaceId === workspaceId && channel.isPrivate
      );

    // Combine and sort all channels
    return [...publicChannels, ...userPrivateChannels].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error("Failed to fetch channels:", error);
    return [];
  }
}

export async function getChannelById(channelId: string) {
  try {
    const channel = await db.query.channels.findFirst({
      where: (channels, { eq }) => eq(channels.id, channelId),
    });

    return channel;
  } catch (error) {
    console.error("Failed to fetch channel:", error);
    return null;
  }
}
