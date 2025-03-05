"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchInputProps {
  workspaceId: string;
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({
  workspaceId,
  initialQuery = "",
  onSearch,
  placeholder = "Search...",
  autoFocus = false,
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const debouncedQuery = useDebounce(query, 300);

  // Handle debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      if (onSearch) {
        setIsLoading(true);
        onSearch(debouncedQuery);
        setIsLoading(false);
      } else if (!pathname.includes("/search")) {
        // Only navigate if we're not already on the search page
        setIsLoading(true);
        router.push(
          `/${workspaceId}/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        setIsLoading(false);
      }
    }
  }, [debouncedQuery, onSearch, router, workspaceId, pathname]);

  // When initialQuery changes externally, update local state
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/${workspaceId}/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center border rounded-md transition-all ${
          isFocused ? "border-primary ring-2 ring-primary/10" : "border-input"
        } bg-background`}
      >
        <div className="flex items-center pl-3 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 rounded-full mr-2"
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
    </div>
  );
}
