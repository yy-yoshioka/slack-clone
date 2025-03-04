import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { ChannelCreateForm } from "@/components/channels/channel-create-form";

export default async function CreateChannelPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const workspace = await getWorkspaceById(params.workspaceId);

  if (!workspace) {
    redirect("/workspaces");
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">
        Create a Channel in {workspace.name}
      </h1>
      <ChannelCreateForm workspaceId={params.workspaceId} />
    </div>
  );
}
