"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { POPULAR_EMOJIS } from "@/lib/constants";

type AddReactionProps = {
  messageId: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export function AddReaction({
  // messageId not used in component but required in AddReactionProps
  onSelect,
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 w-64"
    >
      <div className="flex flex-wrap gap-1 max-w-[300px]">
        {POPULAR_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              onSelect(emoji);
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
