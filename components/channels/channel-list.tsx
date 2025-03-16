"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hash, Lock, Plus, ChevronDown } from "lucide-react";
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

  // Add localStorage persistence for section expanded state
  useEffect(() => {
    const storedState = localStorage.getItem("channelsOpen");
    if (storedState !== null) {
      setIsOpen(storedState === "true");
    }
  }, []);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("channelsOpen", String(newState));
  };

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between py-2 px-3 cursor-pointer group"
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <ChevronDown
            className={`h-[18px] w-[18px] mr-1 text-[#BCABBC] group-hover:text-white transition-transform duration-200 ${
              isOpen ? "" : "transform -rotate-90"
            }`}
          />
          <span className="text-xs font-medium uppercase text-[#BCABBC] group-hover:text-white transition-colors duration-150">
            Channels
          </span>
        </div>
        <ChannelForm
          workspaceId={workspaceId}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded hover:bg-[#350D36] p-0 text-[#BCABBC] hover:text-white transition-colors duration-150"
            >
              <Plus className="h-[18px] w-[18px]" />
            </Button>
          }
        />
      </div>

      {isOpen && (
        <div className="space-y-1">
          {channels.length === 0 ? (
            <p className="text-xs text-[#BCABBC] px-3 py-1">No channels yet</p>
          ) : (
            channels.map((channel) => {
              const isActive = pathname === `/${workspaceId}/${channel.id}`;
              return (
                <Link
                  key={channel.id}
                  href={`/${workspaceId}/${channel.id}`}
                  className={cn(
                    "group flex items-center pl-6 pr-2 py-[6px] text-sm rounded-md hover:bg-[#350D36] transition-colors duration-150",
                    isActive
                      ? "bg-[#1164A3] text-white"
                      : "text-[#BCABBC] hover:text-white"
                  )}
                >
                  {channel.isPrivate ? (
                    <Lock
                      className={cn(
                        "h-[18px] w-[18px] mr-2 flex-shrink-0",
                        isActive
                          ? "text-white"
                          : "text-[#BCABBC] group-hover:text-white"
                      )}
                    />
                  ) : (
                    <Hash
                      className={cn(
                        "h-[18px] w-[18px] mr-2 flex-shrink-0",
                        isActive
                          ? "text-white"
                          : "text-[#BCABBC] group-hover:text-white"
                      )}
                    />
                  )}
                  <span>{channel.name}</span>
                </Link>
              );
            })
          )}
          <Link
            href={`/${workspaceId}/channel/create`}
            className="flex items-center pl-6 pr-2 py-[6px] text-sm rounded-md hover:bg-[#350D36] text-[#BCABBC] hover:text-white transition-colors duration-150"
          >
            <Plus className="h-[18px] w-[18px] mr-2 text-[#BCABBC] group-hover:text-white" />
            <span>Add channels</span>
          </Link>
        </div>
      )}
    </div>
  );
}
