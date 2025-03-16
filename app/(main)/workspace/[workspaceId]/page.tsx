import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Verify workspace membership
  const { data: workspaceMember } = await supabase
    .from("workspace_members")
    .select()
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!workspaceMember) {
    redirect("/");
  }

  // Get default channel (general or first available channel)
  const { data: defaultChannel } = await supabase
    .from("channels")
    .select("id")
    .eq("workspace_id", params.workspaceId)
    .eq("name", "general")
    .single();

  if (defaultChannel) {
    redirect(`/workspace/${params.workspaceId}/channel/${defaultChannel.id}`);
  }

  // If no general channel, get the first available channel
  const { data: firstChannel } = await supabase
    .from("channels")
    .select("id")
    .eq("workspace_id", params.workspaceId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (firstChannel) {
    redirect(`/workspace/${params.workspaceId}/channel/${firstChannel.id}`);
  }

  // If no channels exist yet, redirect to channel creation
  redirect(`/workspace/${params.workspaceId}/channel/create`);
}
