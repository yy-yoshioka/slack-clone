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
  SmilePlus,
  Reply,
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
    parentMessageId?: string;
  };
  workspaceId: string;
  channelId: string;
  currentUserId: string;
  highlightText?: string;
};

interface ReactionUser {
  id: string;
  name: string | null;
  imageUrl: string | null;
}

interface ReactionData {
  [emoji: string]: {
    count: number;
    users: ReactionUser[];
    hasReacted: boolean;
  };
}

interface MessageAttachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size?: number;
  createdAt?: Date;
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
  const [reactions, setReactions] = useState<ReactionData>({});
  const [files, setFiles] = useState<MessageAttachment[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
      if (reactionData) {
        setReactions(reactionData);
      }
    }

    loadReactions();
  }, [id]);

  useEffect(() => {
    async function loadFiles() {
      const fileData = await getMessageFiles(id);
      if (fileData && Array.isArray(fileData)) {
        // Make sure fileData contains all required properties
        const processedFiles = fileData.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type || "unknown",
          size: file.size,
          createdAt: file.createdAt,
        }));
        setFiles(processedFiles);
      }
    }

    loadFiles();
  }, [id]);

  const handleReactionUpdate = async () => {
    const reactionData = await getReactionCounts(id);
    if (reactionData) {
      setReactions(reactionData);
    }
  };

  const handlePin = async () => {
    setIsPinning(true);
    try {
      await pinMessage(id, !message.isPinned);
      toast.success(message.isPinned ? "Message unpinned" : "Message pinned");

      // Simulating update from server
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to pin message");
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMessage(id);
      toast.success("Message deleted");

      // Simulating update from server
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (editedContent === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await editMessage(id, editedContent);
      toast.success("Message updated");

      // Simulating update from server
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update message");
    } finally {
      setIsEditing(false);
    }
  };

  const highlightSearchMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
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

  // Function to format the message content with Markdown support
  const renderFormattedContent = () => {
    if (highlightText) {
      return highlightSearchMatch(message.content, highlightText);
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-sm dark:prose-invert max-w-none break-words"
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded text-sm"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote({ node, className, children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-gray-300 dark:border-gray-700 pl-3 italic text-gray-800 dark:text-gray-300"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          ul({ node, className, children, ...props }) {
            return (
              <ul className="list-disc pl-5 space-y-1" {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, className, children, ...props }) {
            return (
              <ol className="list-decimal pl-5 space-y-1" {...props}>
                {children}
              </ol>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 transition-colors relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex space-x-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage
            src={message.user?.imageUrl || ""}
            alt={message.user?.name || "User"}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium">
              {message.user?.name || message.user?.email || "Unknown User"}
            </p>
            <span
              className="text-xs text-gray-500 ml-2 hover:underline cursor-default"
              title={message.createdAt.toLocaleString()}
            >
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
                placeholder="Message (format with Markdown: **bold**, *italic*, ```code```, > quote, - list)"
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
            <div>{renderFormattedContent()}</div>
          )}

          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file) => (
                <MessageFileAttachment key={file.id} file={file} />
              ))}
            </div>
          )}

          {/* Message reactions */}
          <MessageReactions
            messageId={id}
            reactions={reactions}
            onReactionUpdate={handleReactionUpdate}
          />

          {/* Thread view link */}
          {message.isThreadParent ? (
            <div className="mt-2">
              <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-3"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  View thread
                  {message.replyCount && message.replyCount > 0 && (
                    <span className="ml-1.5 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {message.replyCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          ) : message.parentMessageId ? null : (
            <div
              className={`mt-2 ${
                showActions ? "opacity-100" : "opacity-0"
              } transition-opacity duration-150`}
            >
              <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-3"
                >
                  <Reply className="h-3.5 w-3.5 mr-1.5" />
                  Reply in thread
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Message actions menu - visible on hover */}
        <div
          className={`flex-shrink-0 ${
            showActions ? "opacity-100" : "opacity-0"
          } transition-opacity duration-150`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${workspaceId}/${channelId}/thread/${id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply in thread
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePin} disabled={isPinning}>
                <Bookmark className="h-4 w-4 mr-2" />
                {message.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPickerOpen(true)}>
                <SmilePlus className="h-4 w-4 mr-2" />
                Add reaction
              </DropdownMenuItem>
              {isCurrentUserAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
