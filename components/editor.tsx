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
  Hash,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface EditorProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export function Editor({ placeholder, onChange, onSubmit }: EditorProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit?.(value);
    setValue("");
  };

  const formatButtons = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Strikethrough, label: "Strikethrough" },
    { icon: LinkIcon, label: "Link" },
    { icon: List, label: "Bullet list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: Code, label: "Code" },
    { icon: Quote, label: "Quote" },
  ];

  const quickActions = [
    { icon: Smile, label: "Add emoji" },
    { icon: AtSign, label: "Mention someone" },
    { icon: Hash, label: "Mention channel" },
    { icon: Paperclip, label: "Attach files" },
  ];

  return (
    <div className="border rounded-md bg-background">
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="min-h-[80px] border-0 focus-visible:ring-0 resize-none"
      />

      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-0.5">
          <div className="flex items-center gap-0.5 border-r pr-2">
            {formatButtons.map((button) => (
              <Button
                key={button.label}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => {
                  /* TODO: Implement formatting */
                }}
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 pl-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => {
                  /* TODO: Implement action */
                }}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
