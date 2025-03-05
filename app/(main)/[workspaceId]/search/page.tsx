import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/db";
import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";

interface SearchPageProps {
  params: {
    workspaceId: string;
  };
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
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
    where: (workspaces, { eq }) => eq(workspaces.id, params.workspaceId),
  });

  if (!workspace) {
    redirect("/");
  }

  const query = searchParams.q || "";

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <SearchInput
          workspaceId={params.workspaceId}
          initialQuery={query}
          placeholder="Search for messages, files, and channels"
          autoFocus={true}
          className="max-w-2xl"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <SearchResults workspaceId={params.workspaceId} initialQuery={query} />
      </div>
    </div>
  );
}
