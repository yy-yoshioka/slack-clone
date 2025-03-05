"use client";

import { useState, useEffect } from "react";
import { Search, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface MessageSearchProps {
  channelId: string;
  onSearch: (query: string) => void;
  onNavigate?: (messageId: string) => void;
  matchCount?: number;
  isSearching?: boolean;
}

export function MessageSearch({
  channelId,
  onSearch,
  onNavigate,
  matchCount = 0,
  isSearching = false,
}: MessageSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search messages</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in this channel"
          className="h-8 pl-8 pr-8 w-60 text-sm"
          autoFocus
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {matchCount > 0 && onNavigate && (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">{matchCount} results</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(false)}
        className={cn("h-8 w-8 p-0", query ? "hidden" : "")}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
