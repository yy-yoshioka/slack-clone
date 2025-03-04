"use server";
import { supabase } from "./supabase";
import { db } from "@/db/db";
import { users } from "@/db/schema/users";
import { profiles } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { getSupabaseBrowserClient } from "./supabase";

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = SignInCredentials & {
  fullName?: string;
};

// Sign in with email and password
export async function signInWithPassword(credentials: SignInCredentials) {
  const { email, password } = credentials;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign up with email and password
export async function signUpWithPassword(credentials: SignUpCredentials) {
  const { email, password, fullName } = credentials;

  // Create the auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // If auth user is created, create a user record in our database
  if (authData.user) {
    try {
      // Create user record
      const [user] = await db
        .insert(users)
        .values({
          email,
          authId: authData.user.id,
        })
        .returning();

      // Create profile record
      if (user) {
        await db.insert(profiles).values({
          userId: user.id,
          displayName: fullName || email.split("@")[0],
          fullName,
        });
      }
    } catch (error) {
      // If database insert fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error("Failed to create user profile");
    }
  }

  return authData;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = getSupabaseBrowserClient();
  const redirectURL = new URL(
    "/auth/update-password",
    process.env.NEXT_PUBLIC_APP_URL
  );

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectURL.toString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

// Get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Get user profile
export async function getUserProfile(userId: string) {
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  return userProfile;
}
