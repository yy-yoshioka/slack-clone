"use client";

import { useState } from "react";
import { X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type FilePreviewProps = {
  url: string;
  name: string;
  size?: number;
  type?: string;
  onRemove: () => void;
};

export function FilePreview({
  url,
  name,
  size,
  type,
  onRemove,
}: FilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isImage =
    type?.startsWith("image/") || url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="group relative border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isImage ? (
        <div className="relative w-32 h-32">
          <Image
            src={url}
            alt={name}
            fill
            className="object-cover rounded-md"
            unoptimized
          />
          <Button
            variant="destructive"
            size="icon"
            className={`absolute -top-2 -right-2 h-6 w-6 rounded-full transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2">
          <FileIcon className="h-5 w-5 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            {size && (
              <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
