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
import { MessageFileAttachment } from "@/components/messages/message-file-attachment";
import { getMessageFiles } from "@/lib/actions/file-actions";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

type MessageItemProps = {
  id: string;
  message: {
    id: string;
    content: string;
    createdAt: Date;
    user: User;
    isEdited: boolean;
    isPinned: boolean;
    isThreadParent: boolean;
    replyCount?: number;
  };
  workspaceId: string;
  channelId: string;
  currentUserId: string;
  highlightText?: string;
};

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageAttachment {
  id: string;
  url: string;
  type: string;
  name: string;
  // Add other properties
}

export function MessageItem({
  id,
  message,
  workspaceId,
  channelId,
  currentUserId,
  highlightText,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [reactions, setReactions] = useState<Reaction>({});
  const [files, setFiles] = useState<MessageAttachment[]>([]);

  const isCurrentUserAuthor = message.user?.id === currentUserId;
  const initials = message.user?.name
    ? message.user.name
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
  }, [id, currentUserId]);

  useEffect(() => {
    async function loadFiles() {
      const messageFiles = await getMessageFiles(id);
      setFiles(messageFiles);
    }

    loadFiles();
  }, [id]);

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

  const highlightSearchMatch = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 transition-colors">
      <div className="flex space-x-3">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={message.user?.imageUrl || ""}
            alt={message.user?.name || "User"}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="text-sm font-medium">
              {message.user?.name || message.user?.email || "Unknown User"}
            </p>
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-500 ml-2">(edited)</span>
            )}
            {message.isPinned && (
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
                    setEditedContent(message.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {highlightText
                ? highlightSearchMatch(message.content, highlightText)
                : message.content}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file) => (
                <MessageFileAttachment key={file.id} file={file} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {message.isThreadParent ? (
              <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  View thread
                  {message.replyCount && message.replyCount > 0 && (
                    <span className="ml-1 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {message.replyCount}
                    </span>
                  )}
                </Button>
              </Link>
            ) : message.parentMessageId ? null : (
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
                    {message.isPinned ? "Unpin message" : "Pin message"}
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
