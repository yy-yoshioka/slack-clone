"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { db } from "@/db/db";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

// This is a temporary mock function - will be replaced with actual auth check
async function getUserWithProfile() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return { user: null, profile: null };

  const profile = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.authId, data.user.id),
    with: {
      profile: true,
    },
  });

  return {
    user: data.user,
    profile: profile?.profile || null,
  };
}

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId?: string; channelId?: string };
}) {
  const { user, profile } = await getUserWithProfile();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <WorkspaceLayout
      user={user}
      profile={profile}
      workspaceId={params.workspaceId}
      channelId={params.channelId}
    >
      {children}
    </WorkspaceLayout>
  );
}
