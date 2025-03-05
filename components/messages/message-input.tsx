"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createMessage } from "@/lib/actions/message-actions";
import { toast } from "sonner";
import { FileUpload } from "@/components/files/file-upload";
import { FilePreview } from "@/components/files/file-preview";

type MessageInputProps = {
  channelId: string;
  workspaceId: string;
};

type Attachment = {
  url: string;
  name: string;
  size: number;
  type: string;
};

export function MessageInput({ channelId, workspaceId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    try {
      setIsLoading(true);
      const result = await createMessage(channelId, {
        content,
        attachments,
      });

      if (result.success) {
        setContent("");
        setAttachments([]);
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (
    url: string,
    name: string,
    size: number,
    type: string
  ) => {
    setAttachments([...attachments, { url, name, size, type }]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2 p-4 border-t dark:border-gray-700">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <FilePreview
              key={index}
              url={file.url}
              name={file.name}
              size={file.size}
              type={file.type}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="resize-none"
            rows={1}
          />
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!content.trim() && attachments.length === 0)}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
