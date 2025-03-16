"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AddReaction } from "@/components/messages/add-reaction";
import { toggleReaction } from "@/lib/actions/reaction-actions";
import { useToast } from "@/components/ui/use-toast";
import { SmileIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ReactionUser = {
  id: string;
  name: string | null;
  imageUrl: string | null;
};

type ReactionData = {
  [emoji: string]: {
    count: number;
    users: ReactionUser[];
    hasReacted: boolean;
  };
};

type MessageReactionsProps = {
  messageId: string;
  reactions: ReactionData;
  onReactionUpdate?: () => void;
};

export function MessageReactions({
  messageId,
  reactions,
  onReactionUpdate,
}: MessageReactionsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { toast } = useToast();

  const handleReactionClick = async (emoji: string) => {
    try {
      const result = await toggleReaction(messageId, emoji);

      if (result.success) {
        onReactionUpdate?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to toggle reaction",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to toggle reaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {Object.entries(reactions).map(([emoji, data]) => (
        <HoverCard key={emoji} openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs rounded-full border transition-all duration-150",
                data.hasReacted
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 hover:dark:bg-blue-900/50"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              )}
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji} <span className="ml-1 font-medium">{data.count}</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-60 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="mr-2 text-lg">{emoji}</div>
                <p className="text-sm font-medium">
                  {data.count} {data.count === 1 ? "reaction" : "reactions"}
                </p>
              </div>
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                {data.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 py-1">
                    <Avatar className="h-6 w-6">
                      {user.imageUrl ? (
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.name || ""}
                        />
                      ) : (
                        <AvatarFallback>
                          {getUserInitials(user.name || user.id)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">{user.name || "Anonymous"}</span>
                    {data.users[0]?.id === user.id && (
                      <span className="text-xs text-gray-500 ml-auto">
                        First reaction
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs rounded-full border border-dashed border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 group"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
      >
        <SmileIcon className="h-3.5 w-3.5 mr-1 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
        <span className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
          Add
        </span>
      </Button>

      {isPickerOpen && (
        <div className="absolute z-10 mt-1">
          <AddReaction
            messageId={messageId}
            onSelect={handleReactionClick}
            onClose={() => setIsPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
