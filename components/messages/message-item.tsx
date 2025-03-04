"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  MessageSquare,
  Bookmark,
  Trash,
  Pencil,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  pinMessage,
  deleteMessage,
  editMessage,
} from "@/lib/actions/message-actions";
import { toast } from "sonner";
import Link from "next/link";
import { MessageReactions } from "@/components/messages/message-reactions";
import { getReactionCounts } from "@/lib/actions/reaction-actions";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

type MessageItemProps = {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
  isEdited: boolean;
  isPinned: boolean;
  isThreadParent: boolean;
  workspaceId: string;
  channelId: string;
  currentUserId: string;
  replyCount?: number;
  parentMessageId?: string;
  reactionsLastUpdated?: number;
};

export function MessageItem({
  id,
  content,
  createdAt,
  user,
  isEdited,
  isPinned,
  isThreadParent,
  workspaceId,
  channelId,
  currentUserId,
  replyCount,
  parentMessageId,
  reactionsLastUpdated,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [reactions, setReactions] = useState<any>({});

  const isCurrentUserAuthor = user?.id === currentUserId;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  useEffect(() => {
    async function loadReactions() {
      const reactionData = await getReactionCounts(id);

      // Mark reactions the current user has made
      Object.keys(reactionData).forEach((emoji) => {
        const userIds = reactionData[emoji].users.map((u) => u.id);
        reactionData[emoji].hasReacted = userIds.includes(currentUserId);
      });

      setReactions(reactionData);
    }

    loadReactions();
  }, [id, currentUserId, reactionsLastUpdated]);

  const handleReactionUpdate = async () => {
    const reactionData = await getReactionCounts(id);

    // Mark reactions the current user has made
    Object.keys(reactionData).forEach((emoji) => {
      const userIds = reactionData[emoji].users.map((u) => u.id);
      reactionData[emoji].hasReacted = userIds.includes(currentUserId);
    });

    setReactions(reactionData);
  };

  const handlePin = async () => {
    setIsPinning(true);
    try {
      const result = await pinMessage(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast(result.isPinned ? "Message pinned" : "Message unpinned");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to pin message"
      );
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMessage(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast("Message deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (editedContent.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      const result = await editMessage(id, { content: editedContent });
      if (!result.success) {
        throw new Error(result.error);
      }
      setIsEditing(false);
      toast("Message updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update message"
      );
    }
  };

  return (
    <div className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.imageUrl || ""} alt={user?.name || "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="text-sm font-medium">
              {user?.name || user?.email || "Unknown User"}
            </p>
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-500 ml-2">(edited)</span>
            )}
            {isPinned && (
              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-500 px-1.5 py-0.5 rounded ml-2">
                Pinned
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleEdit}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{content}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {isThreadParent ? (
              <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  View thread
                  {replyCount && replyCount > 0 && (
                    <span className="ml-1 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {replyCount}
                    </span>
                  )}
                </Button>
              </Link>
            ) : parentMessageId ? null : (
              <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Reply in thread
                </Button>
              </Link>
            )}
            <MessageReactions
              messageId={id}
              reactions={reactions}
              currentUserId={currentUserId}
              onReactionUpdate={handleReactionUpdate}
            />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePin} disabled={isPinning}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    {isPinned ? "Unpin message" : "Pin message"}
                  </DropdownMenuItem>

                  {isCurrentUserAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit message
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete message
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
