import { FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface WorkspaceSidebarProps {
  workspace: {
    id: string;
  };
}

const WorkspaceSidebar = ({ workspace }: WorkspaceSidebarProps) => {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <Link
        href={`/${workspace.id}/files`}
        className={cn(
          "group flex items-center px-3 py-2 rounded-md text-sm font-medium",
          pathname === `/${workspace.id}/files`
            ? "bg-primary/10 text-primary"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-800"
        )}
      >
        <FileText className="mr-2 h-4 w-4" />
        Files
      </Link>
    </div>
  );
};

export default WorkspaceSidebar;
