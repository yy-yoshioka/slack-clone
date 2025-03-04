"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createThreadReply } from "@/lib/actions/thread-actions";
import { toast } from "sonner";

type ThreadReplyProps = {
  channelId: string;
  parentMessageId: string;
};

export function ThreadReply({ channelId, parentMessageId }: ThreadReplyProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const result = await createThreadReply(channelId, parentMessageId, {
        content,
      });

      if (result.success) {
        setContent("");
      } else {
        toast.error(result.error || "Failed to send reply");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Reply to thread..."
        className="resize-none"
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !content.trim()}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Reply
        </Button>
      </div>
    </div>
  );
}
