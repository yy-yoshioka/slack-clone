import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold">Welcome to SlackClone</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A modern messaging app for teams
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Your Workspaces</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage your workspaces
            </p>
            <Link href="/workspaces" className="text-blue-600 hover:underline">
              Browse workspaces →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create a Workspace</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start a new workspace for your team
            </p>
            <Link
              href="/workspaces/create"
              className="text-blue-600 hover:underline"
            >
              Create workspace →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
