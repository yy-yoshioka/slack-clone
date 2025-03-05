import { notFound, redirect } from "next/navigation";
import { getWorkspaceById } from "@/lib/actions/workspace-actions";
import { getChannelsForWorkspace } from "@/lib/actions/channel-actions";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function WorkspacePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = await Promise.resolve(params);

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) {
    notFound();
  }

  const channels = await getChannelsForWorkspace(workspaceId);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{workspace.name}</h1>
        {workspace.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {workspace.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Channels</h2>
            <Link href={`/${workspaceId}/channels/create`}>
              <Button variant="ghost" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Channel
              </Button>
            </Link>
          </div>

          {channels.length === 0 ? (
            <p className="text-gray-500 text-sm">No channels yet</p>
          ) : (
            <ul className="space-y-2">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <Link
                    href={`/${workspaceId}/${channel.id}`}
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">#{channel.name}</span>
                    {channel.isPrivate && (
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Private
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Workspace Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created
              </p>
              <p className="text-sm font-medium">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* You could add more workspace info here later */}
            <div className="pt-4">
              <Link href={`/${workspaceId}/settings`}>
                <Button variant="outline" size="sm">
                  Workspace Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
