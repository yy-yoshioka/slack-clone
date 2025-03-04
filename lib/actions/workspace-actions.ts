"use server";

import { db } from "@/db/db";
import { workspaces, workspaceMembers } from "@/db/schema/workspaces";
import { channels } from "@/db/schema/channels";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type WorkspaceFormValues = {
  name: string;
  description?: string;
};

export async function createWorkspace(data: WorkspaceFormValues) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to create a workspace");
    }

    // Find the user ID from our database based on the auth ID
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      throw new Error("User profile not found");
    }

    // Generate a base slug from the name
    const baseSlug = data.name.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness and generate a new one if needed
    let existingWorkspace;
    do {
      existingWorkspace = await db.query.workspaces.findFirst({
        where: (workspaces, { eq }) => eq(workspaces.slug, slug),
      });

      if (existingWorkspace) {
        // If slug exists, append a number and try again
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } while (existingWorkspace);

    // Create the workspace with the unique slug
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: data.name,
        slug,
        description: data.description || null,
        ownerId: dbUser.id,
      })
      .returning();

    // Add the creator as an admin member
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: dbUser.id,
      role: "admin",
    });

    // Create a default "general" channel for the workspace
    await db.insert(channels).values({
      name: "general",
      description: "General discussion channel",
      workspaceId: workspace.id,
      isPrivate: false,
    });

    revalidatePath("/");
    return { success: true, workspaceId: workspace.id };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create workspace",
    };
  }
}

export async function getWorkspaces() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return [];
    }

    // Find the user ID from our database
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, user.id),
    });

    if (!dbUser) {
      return [];
    }

    // Get workspaces where the user is a member
    const workspacesWithMembership = await db.query.workspaceMembers.findMany({
      where: (members, { eq }) => eq(members.userId, dbUser.id),
      with: {
        workspace: true,
      },
    });

    // Extract just the workspace objects and return them
    return workspacesWithMembership.map((membership) => membership.workspace);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    return [];
  }
}

export async function getWorkspaceById(workspaceId: string) {
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: (workspaces, { eq }) => eq(workspaces.id, workspaceId),
    });

    return workspace;
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    return null;
  }
}
