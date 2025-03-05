import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import { FileBrowser } from "@/components/files/file-browser";
import { FileText } from "lucide-react";

interface FilesPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function FilesPage({ params }: FilesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/");
  }

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.authId, user.id),
  });

  if (!dbUser) {
    redirect("/auth?next=/");
  }

  // Fetch workspace to verify it exists and user has access
  const workspace = await db.query.workspaces.findFirst({
    where: (workspaces, { eq, and }) =>
      and(
        eq(workspaces.id, params.workspaceId),
        eq(workspaces.ownerId, dbUser.id)
      ),
  });

  if (!workspace) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Files</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse all files shared in this workspace
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <FileBrowser workspaceId={params.workspaceId} />
      </div>
    </div>
  );
}
