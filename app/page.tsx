import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/db";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.authId, user.id),
  });

  if (!dbUser) {
    redirect("/auth/sign-in");
  }

  // Get user's workspaces
  const userWorkspaces = await db.query.workspaceMembers.findMany({
    where: (members, { eq }) => eq(members.userId, dbUser.id),
    with: {
      workspace: true,
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Workspaces</h2>
            <p className="text-muted-foreground">
              View and manage your workspaces
            </p>
            <div className="space-y-2">
              {userWorkspaces.length === 0 ? (
                <div className="p-4 border rounded-lg hover:border-foreground/20 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    No workspaces yet
                  </p>
                </div>
              ) : (
                userWorkspaces.map(({ workspace }) => (
                  <Link
                    key={workspace.id}
                    href={`/${workspace.id}`}
                    className="block p-4 border rounded-lg hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#4A154B] flex items-center justify-center text-white font-semibold">
                        {workspace.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{workspace.name}</h3>
                        {workspace.description && (
                          <p className="text-sm text-muted-foreground">
                            {workspace.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Create a Workspace</h2>
            <p className="text-muted-foreground">
              Start a new workspace for your team
            </p>
            <Button asChild>
              <Link href="/workspaces/create" className="flex items-center">
                Create workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
