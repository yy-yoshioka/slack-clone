"use server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

// This is a temporary mock data function - will be replaced with actual data fetching
async function getWorkspaces() {
  // Return empty array for now - this will be implemented in later steps
  return [];
}

// This is a temporary mock function - will be replaced with actual auth check
async function getUser() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.getUser();

  console.log("Auth Error:", error);

  if (error) {
    console.error("Auth error:", error);
    return null;
  }

  return data?.user;
}

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId?: string; channelId?: string };
}) {
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  const workspaces = await getWorkspaces();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 h-full hidden md:block">
        <Sidebar
          workspaces={workspaces}
          currentWorkspaceId={params.workspaceId}
        />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          user={user}
          workspaceId={params.workspaceId}
          channelId={params.channelId}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
