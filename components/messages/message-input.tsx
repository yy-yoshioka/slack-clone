"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Editor } from "@/components/editor";
import { FileUpload } from "@/components/files/file-upload";

interface MessageInputProps {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "conversation" | "channel";
}

type Attachment = {
  name: string;
  url: string;
  size: number;
  type?: string;
};

export const MessageInput = ({
  apiUrl,
  query,
  name,
  type,
}: MessageInputProps) => {
  const router = useRouter();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (value: string) => {
    if (!value.trim() && attachments.length === 0) return;

    try {
      setIsSubmitting(true);
      const url = `${apiUrl}?${new URLSearchParams(query)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: value,
          attachments,
        }),
      });

      if (res.ok) {
        setAttachments([]);
        router.refresh();
      } else {
        const error = await res.json();
        throw new Error(error?.message || "Something went wrong");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAttachmentUploaded = (
    url: string,
    name: string,
    size: number,
    type: string
  ) => {
    setAttachments((prev) => [...prev, { name, url, size, type }]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    const fileUploadElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileUploadElement) {
      fileUploadElement.click();
    }
  };

  return (
    <div className="p-4 relative">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center gap-2 pr-8"
            >
              <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate max-w-40">
                {attachment.name}
              </span>
              <button
                onClick={() => handleRemoveAttachment(index)}
                className="absolute right-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="hidden">
        <FileUpload
          onFileUpload={onAttachmentUploaded}
          onUploading={setIsUploading}
          showButton={false}
        />
      </div>

      <Editor
        placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
        onSubmit={onSubmit}
        onAttachClick={handleAttachClick}
        isSubmitting={isSubmitting || isUploading}
      />
    </div>
  );
};
