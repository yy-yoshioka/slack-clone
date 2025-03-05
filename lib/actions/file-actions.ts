"use server";

import { db } from "@/db/db";
import { files } from "@/db/schema/files";
import { messages } from "@/db/schema/messages";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/client";

// Create a file record in the database
export async function createFileRecord(
  url: string,
  name: string,
  size: number,
  type: string,
  messageId?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Create file record
    const [fileRecord] = await db
      .insert(files)
      .values({
        url,
        name,
        size,
        type,
        userId: dbUser.id,
        messageId,
      })
      .returning();

    return { success: true, file: fileRecord };
  } catch (error) {
    console.error("Error creating file record:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create file record",
    };
  }
}

// Update message with file attachment
export async function attachFileToMessage(messageId: string, fileId: string) {
  try {
    await db
      .update(messages)
      .set({
        fileIds: db.sql`array_append(COALESCE(file_ids, '{}'), ${fileId})`,
      })
      .where(eq(messages.id, messageId));

    return { success: true };
  } catch (error) {
    console.error("Error attaching file to message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to attach file",
    };
  }
}

// Get files for a message
export async function getMessageFiles(messageId: string) {
  try {
    const messageFiles = await db.query.files.findMany({
      where: (files, { eq }) => eq(files.messageId, messageId),
    });

    return messageFiles;
  } catch (error) {
    console.error("Error fetching message files:", error);
    return [];
  }
}

// Delete file
export async function deleteFile(fileId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get file info
    const file = await db.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, fileId),
    });

    if (!file) {
      return { success: false, error: "File not found" };
    }

    // Delete from Supabase Storage
    if (file.url) {
      const supabase = createClient();
      const filePath = file.url.split("/").pop();

      if (filePath) {
        const { error } = await supabase.storage
          .from("files")
          .remove([`uploads/${filePath}`]);

        if (error) {
          console.error("Error removing file from storage:", error);
        }
      }
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));

    // Revalidate paths if needed
    if (file.messageId) {
      const message = await db.query.messages.findFirst({
        where: (messages, { eq }) => eq(messages.id, file.messageId),
        with: {
          channel: true,
        },
      });

      if (message?.channel) {
        revalidatePath(`/${message.channel.workspaceId}/${message.channelId}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}
