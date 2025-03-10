"use server";

import { db } from "@/db/db";
import { profiles } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "../supabase/client";

// Validation schema for profile updates
const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  fullName: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Get the current user's profile
export async function getUserProfile() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    return { success: false, error: "Not authenticated" };
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.authId, authUser.id),
    with: {
      profile: true,
    },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (!user.profile) {
    return { success: false, error: "Profile not found" };
  }

  return {
    success: true,
    profile: {
      id: user.profile.id,
      displayName: user.profile.displayName,
      fullName: user.profile.fullName,
      email: user.email,
      avatarUrl: user.profile.avatarUrl,
      title: user.profile.title,
      bio: user.profile.bio,
      phoneNumber: user.profile.phoneNumber,
      timezone: user.profile.timezone,
    },
  };
}

// Update user profile
export async function updateUserProfile(data: ProfileFormValues) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, authUser.id),
      with: {
        profile: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate the form data
    const validatedData = profileSchema.parse(data);

    if (!user.profile) {
      // Create new profile if it doesn't exist
      await db.insert(profiles).values({
        userId: user.id,
        displayName: validatedData.displayName,
        fullName: validatedData.fullName || null,
        title: validatedData.title || null,
        bio: validatedData.bio || null,
        phoneNumber: validatedData.phoneNumber || null,
        timezone: validatedData.timezone || null,
      });
    } else {
      // Update existing profile
      await db
        .update(profiles)
        .set({
          displayName: validatedData.displayName,
          fullName: validatedData.fullName || null,
          title: validatedData.title || null,
          bio: validatedData.bio || null,
          phoneNumber: validatedData.phoneNumber || null,
          timezone: validatedData.timezone || null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.profile.id));
    }

    // Revalidate all paths that might display the user's information
    revalidatePath("/profile");
    revalidatePath("/[workspaceId]/[channelId]");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("Failed to update profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

// Upload avatar image
export async function uploadAvatar(file: File) {
  const supabase = createClient();

  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.authId, authUser.id),
      with: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return { success: false, error: "Profile not found" };
    }

    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profiles").getPublicUrl(filePath);

    // Update the profile with the new avatar URL
    await db
      .update(profiles)
      .set({
        avatarUrl: publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.profile.id));

    revalidatePath("/profile");
    revalidatePath("/[workspaceId]/[channelId]");

    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}
