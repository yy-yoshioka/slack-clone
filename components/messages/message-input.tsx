"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { FileUpload } from "@/components/files/file-upload";
import { FilePreview } from "@/components/files/file-preview";
import { Editor } from "@/components/editor";
import { X } from "lucide-react";

export interface MessageInputProps {
  channelId: string;
  suggestions?: string[];
}

type Attachment = {
  url: string;
  name: string;
  size: number;
  type: string;
};

export function MessageInput({
  channelId,
  suggestions = [],
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState(suggestions);

  const handleSubmit = async (value: string) => {
    // TODO: Implement message sending
    console.log("Sending message:", value);
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
    <div className="space-y-2">
      {activeSuggestions.length > 0 && (
        <div className="flex gap-2">
          {activeSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-sm bg-background hover:bg-accent group"
              onClick={() => {
                // TODO: Handle suggestion click
              }}
            >
              <span>{suggestion}</span>
              <X
                className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestions((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                }}
              />
            </Button>
          ))}
        </div>
      )}

      <Editor placeholder={`Message #${channelId}`} onSubmit={handleSubmit} />

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
          disabled={!content.trim() && attachments.length === 0}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
