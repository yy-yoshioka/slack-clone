import { getWorkspaces } from "@/lib/actions/workspace-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
        <Link href="/workspaces/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No workspaces yet</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You don't have any workspaces yet. Create your first workspace to
            get started.
          </p>
          <Link href="/workspaces/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Link
              href={`/${workspace.id}`}
              key={workspace.id}
              className="block"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">{workspace.name}</h2>
                {workspace.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {workspace.description}
                  </p>
                )}
                <span className="text-blue-600 text-sm font-medium">
                  Enter workspace →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
