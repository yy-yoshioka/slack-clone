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
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/utils";

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
      console.log(
        `Attempting to toggle reaction: ${emoji} on message: ${messageId}`
      );
      const result = await toggleReaction(messageId, emoji);
      console.log("Toggle reaction result:", result);

      if (result.success) {
        onReactionUpdate?.();
      } else {
        console.error("Failed to toggle reaction:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to toggle reaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception when toggling reaction:", error);
      toast({
        title: "Error",
        description: "Failed to toggle reaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(reactions).map(([emoji, data]) => (
        <HoverCard key={emoji} openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button
              variant={data.hasReacted ? "secondary" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs rounded-full"
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji} <span className="ml-1">{data.count}</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-56 p-2" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Reacted with {emoji}</p>
              <div className="flex flex-col gap-2">
                {data.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
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
                    <span className="text-xs">{user.name || "Anonymous"}</span>
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>

        {isPickerOpen && (
          <AddReaction
            messageId={messageId}
            onReactionSelect={handleReactionClick}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
