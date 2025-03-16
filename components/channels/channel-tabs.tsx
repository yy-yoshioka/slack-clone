"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Hash, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      icon: <MessageSquare className="h-4 w-4" />,
      exact: true,
    },
    {
      href: `/${workspaceId}/${channelId}/files`,
      label: "Files",
      icon: <FileText className="h-4 w-4" />,
      exact: false,
    },
    {
      href: `/${workspaceId}/${channelId}/saved`,
      label: "Saved Items",
      icon: <FileText className="h-4 w-4" />,
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
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 h-12">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <Hash className="h-5 w-5 mr-1.5 text-gray-500" />
          <h3 className="font-semibold text-base">{channelName}</h3>
        </div>

        <div className="flex">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center px-6 h-12 text-sm font-medium transition-colors relative",
                isActive(tab)
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {isActive(tab) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        asChild
      >
        <Link href={`/${workspaceId}/${channelId}/details`}>
          <Info className="h-4 w-4" />
          <span>Details</span>
        </Link>
      </Button>
    </div>
  );
}
