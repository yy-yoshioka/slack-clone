"use client";

import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  Smile,
  Paperclip,
  AtSign,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onAttachClick?: () => void;
  isSubmitting?: boolean;
}

export function Editor({
  placeholder,
  onChange,
  onSubmit,
  onAttachClick,
  isSubmitting = false,
}: EditorProps) {
  const [value, setValue] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit?.(value);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertFormatting = (startChar: string, endChar: string = startChar) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = value.substring(start, end);

    const newValue =
      value.substring(0, start) +
      startChar +
      selection +
      endChar +
      value.substring(end);

    setValue(newValue);
    onChange?.(newValue);

    // Set cursor position after formatting is applied
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + startChar.length,
          end + startChar.length
        );
      }
    }, 0);
  };

  const formatButtons = [
    {
      icon: Bold,
      label: "Bold (Ctrl+B)",
      action: () => insertFormatting("**"),
    },
    {
      icon: Italic,
      label: "Italic (Ctrl+I)",
      action: () => insertFormatting("*"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => insertFormatting("~~"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertFormatting("`"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) + "> " + value.substring(lineStart);
        setValue(newValue);
        onChange?.(newValue);
      },
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) + "- " + value.substring(lineStart);
        setValue(newValue);
        onChange?.(newValue);
      },
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) + "1. " + value.substring(lineStart);
        setValue(newValue);
        onChange?.(newValue);
      },
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertFormatting("[", "](url)"),
    },
  ];

  const handleEmojiSelect = (emoji: { native: string }) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const newValue =
      value.substring(0, start) + emoji.native + value.substring(start);

    setValue(newValue);
    onChange?.(newValue);
    setIsEmojiPickerOpen(false);
  };

  return (
    <div className="border rounded-xl bg-background hover:border-gray-400 focus-within:border-indigo-500 transition-colors">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-3 px-4 rounded-t-xl"
      />

      <div className="flex items-center justify-between border-t px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <TooltipProvider>
            {formatButtons.map((button) => (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    onClick={button.action}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{button.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <span className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  onClick={onAttachClick}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Attach files</p>
              </TooltipContent>
            </Tooltip>

            <Popover
              open={isEmojiPickerOpen}
              onOpenChange={setIsEmojiPickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-xl">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Mention someone</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          type="submit"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
