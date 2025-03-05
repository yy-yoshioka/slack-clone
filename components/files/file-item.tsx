"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Download,
  Trash,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFile } from "@/lib/actions/file-actions";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface FileItemProps {
  file: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    createdAt: Date;
    message?: {
      id: string;
      channelId: string;
      content: string;
      channel?: {
        id: string;
        name: string;
        workspaceId: string;
      };
      user?: {
        id: string;
        name: string;
        imageUrl?: string;
      };
    };
    user?: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  };
  onDelete?: () => void;
}

export function FileItem({ file, onDelete }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isImage =
    file.type?.startsWith("image/") ||
    file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo =
    file.type?.startsWith("video/") || file.url.match(/\.(mp4|webm|ogg|mov)$/i);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5" />;
    if (isVideo) return <Film className="h-5 w-5" />;
    if (file.type?.startsWith("text/") || file.type?.includes("document"))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await deleteFile(file.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete file");
      }

      toast.success("File deleted successfully");
      if (onDelete) onDelete();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/10 rounded">{getFileIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{file.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span>{formatFileSize(file.size)}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {formatDistanceToNow(new Date(file.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {file.message?.channel && (
              <div className="mt-1">
                <Link
                  href={`/${file.message.channel.workspaceId}/${file.message.channelId}`}
                  className="text-xs text-primary inline-flex items-center hover:underline"
                >
                  #{file.message.channel.name}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
          {(isImage || isVideo) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewOpen(true)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild title="Download">
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center items-center">
            {isImage && (
              <Image
                src={file.url}
                alt={file.name}
                width={1200}
                height={800}
                className="max-h-[60vh] max-w-full object-contain rounded-md"
                unoptimized
              />
            )}
            {isVideo && (
              <video
                src={file.url}
                controls
                className="max-h-[60vh] max-w-full rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
