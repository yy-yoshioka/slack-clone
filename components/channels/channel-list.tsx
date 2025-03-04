"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hash, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelForm } from "@/components/channels/channel-form";

type Channel = {
  id: string;
  name: string;
  isPrivate: boolean;
};

type ChannelListProps = {
  channels: Channel[];
  workspaceId: string;
};

export function ChannelList({ channels, workspaceId }: ChannelListProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between py-2 px-3 text-xs font-semibold cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>CHANNELS</span>
        <ChannelForm
          workspaceId={workspaceId}
          trigger={
            <Button variant="ghost" size="icon" className="h-4 w-4">
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {isOpen && (
        <div className="space-y-[2px]">
          {channels.length === 0 ? (
            <p className="text-xs text-gray-500 px-3 py-1">No channels yet</p>
          ) : (
            channels.map((channel) => (
              <Link
                key={channel.id}
                href={`/${workspaceId}/${channel.id}`}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === `/${workspaceId}/${channel.id}` &&
                    "bg-gray-100 dark:bg-gray-800"
                )}
              >
                {channel.isPrivate ? (
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <Hash className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <span>{channel.name}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
