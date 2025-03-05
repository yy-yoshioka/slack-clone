"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Hash } from "lucide-react";

interface ChannelTabsProps {
  workspaceId: string;
  channelId: string;
  channelName: string;
}

export function ChannelTabs({
  workspaceId,
  channelId,
  channelName,
}: ChannelTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/${workspaceId}/${channelId}`,
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      exact: true,
    },
    {
      href: `/${workspaceId}/${channelId}/files`,
      label: "Files",
      icon: <FileText className="h-4 w-4 mr-2" />,
      exact: false,
    },
  ];

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="flex items-center border-b px-4">
      <div className="flex items-center mr-4">
        <Hash className="h-5 w-5 mr-1 text-gray-500" />
        <h3 className="font-semibold text-lg">{channelName}</h3>
      </div>

      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center py-3 px-2 border-b-2 text-sm font-medium transition-colors",
              isActive(tab)
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
