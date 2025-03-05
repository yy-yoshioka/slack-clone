import { FileText, Image, Film, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type MessageFileAttachmentProps = {
  file: {
    id: string;
    name: string;
    url: string;
    size?: number;
    type?: string;
  };
};

export function MessageFileAttachment({ file }: MessageFileAttachmentProps) {
  const isImage =
    file.type?.startsWith("image/") ||
    file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    const type = file.type || "";
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />;
    if (type.startsWith("text/") || type.includes("document"))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  if (isImage) {
    return (
      <div className="mt-2 max-w-sm">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={file.url}
            alt={file.name}
            className="rounded-md border border-gray-200 dark:border-gray-700 max-h-64 object-contain"
          />
        </a>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href={file.url} download={file.name}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 max-w-sm">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <div className="truncate">
            <p className="text-sm font-medium truncate max-w-[150px]">
              {file.name}
            </p>
            {file.size && (
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href={file.url} download={file.name}>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
