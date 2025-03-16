"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { POPULAR_EMOJIS } from "@/lib/constants";

type AddReactionProps = {
  /* messageId: string; */
  onReactionSelect: (emoji: string) => void;
  onClose: () => void;
};

export function AddReaction({
  /* messageId, */
  onReactionSelect,
  onClose,
}: AddReactionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Handle clicks outside of the emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10"
    >
      <div className="flex flex-wrap gap-1 max-w-[300px]">
        {POPULAR_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              onReactionSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
}
