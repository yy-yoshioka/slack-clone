"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Hash,
  FileText,
  Search,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { searchWorkspace } from "@/lib/actions/search-actions";
import { Skeleton } from "@/components/ui/skeleton";

type SearchTab = "all" | "messages" | "channels" | "files";

interface SearchResultsProps {
  workspaceId: string;
  initialQuery: string;
}

export function SearchResults({
  workspaceId,
  initialQuery,
}: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    messages: any[];
    channels: any[];
    files: any[];
  }>({
    messages: [],
    channels: [],
    files: [],
  });

  // Perform search when query or workspaceId changes
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults({ messages: [], channels: [], files: [] });
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchWorkspace(workspaceId, query);
        if (searchResults.success) {
          setResults({
            messages: searchResults.messages || [],
            channels: searchResults.channels || [],
            files: searchResults.files || [],
          });
        } else {
          console.error("Search error:", searchResults.error);
        }
      } catch (error) {
        console.error("Error performing search:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, workspaceId]);

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {query ? (
              <>
                Search results for <span className="italic">"{query}"</span>
              </>
            ) : (
              "Search"
            )}
          </h2>
          {!isLoading && query && (
            <p className="text-sm text-muted-foreground mt-1">
              Found{" "}
              {results.messages.length +
                results.channels.length +
                results.files.length}{" "}
              results
            </p>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SearchTab)}
      >
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="messages" disabled={isLoading}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="channels" disabled={isLoading}>
            <Hash className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="files" disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="mt-8 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-8 mt-4">
              {results.messages.length === 0 &&
              results.channels.length === 0 &&
              results.files.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No results found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <>
                  {results.messages.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        <h3 className="text-lg font-medium">Messages</h3>
                      </div>
                      <div className="space-y-4">
                        {results.messages.slice(0, 3).map((message) => (
                          <MessageResult
                            key={message.id}
                            message={message}
                            workspaceId={workspaceId}
                            highlight={highlightMatch}
                          />
                        ))}
                        {results.messages.length > 3 && (
                          <Link
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTab("messages");
                            }}
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            View all {results.messages.length} messages
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {results.channels.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Hash className="h-5 w-5 mr-2" />
                        <h3 className="text-lg font-medium">Channels</h3>
                      </div>
                      <div className="space-y-2">
                        {results.channels.map((channel) => (
                          <ChannelResult
                            key={channel.id}
                            channel={channel}
                            workspaceId={workspaceId}
                            highlight={highlightMatch}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {results.files.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <FileText className="h-5 w-5 mr-2" />
                        <h3 className="text-lg font-medium">Files</h3>
                      </div>
                      <div className="space-y-3">
                        {results.files.slice(0, 3).map((file) => (
                          <FileResult
                            key={file.id}
                            file={file}
                            highlight={highlightMatch}
                          />
                        ))}
                        {results.files.length > 3 && (
                          <Link
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTab("files");
                            }}
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            View all {results.files.length} files
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 mt-4">
              {results.messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No messages found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                </div>
              ) : (
                results.messages.map((message) => (
                  <MessageResult
                    key={message.id}
                    message={message}
                    workspaceId={workspaceId}
                    highlight={highlightMatch}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="channels" className="space-y-3 mt-4">
              {results.channels.length === 0 ? (
                <div className="text-center py-12">
                  <Hash className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No channels found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                </div>
              ) : (
                results.channels.map((channel) => (
                  <ChannelResult
                    key={channel.id}
                    channel={channel}
                    workspaceId={workspaceId}
                    highlight={highlightMatch}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-3 mt-4">
              {results.files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No files found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                </div>
              ) : (
                results.files.map((file) => (
                  <FileResult
                    key={file.id}
                    file={file}
                    highlight={highlightMatch}
                  />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// Message result component
function MessageResult({
  message,
  workspaceId,
  highlight,
}: {
  message: any;
  workspaceId: string;
  highlight: (text: string) => React.ReactNode;
}) {
  return (
    <Link
      href={`/${workspaceId}/${message.channel.id}`}
      className="block p-3 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex items-start gap-3">
        <Avatar
          className="h-8 w-8 rounded-full"
          src={message.user?.imageUrl}
          alt={message.user?.name || "User"}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {message.user?.name || "Unknown user"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm line-clamp-2 mt-1">
            {highlight(message.content)}
          </p>
          <div className="mt-1 text-xs text-primary flex items-center">
            <Hash className="h-3 w-3 mr-1" />
            {message.channel.name}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Channel result component
function ChannelResult({
  channel,
  workspaceId,
  highlight,
}: {
  channel: any;
  workspaceId: string;
  highlight: (text: string) => React.ReactNode;
}) {
  return (
    <Link
      href={`/${workspaceId}/${channel.id}`}
      className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-md h-10 w-10 flex items-center justify-center">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">{highlight(channel.name)}</div>
          {channel.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {highlight(channel.description)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// File result component
function FileResult({
  file,
  highlight,
}: {
  file: any;
  highlight: (text: string) => React.ReactNode;
}) {
  const isImage =
    file.type?.startsWith("image/") ||
    file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo =
    file.type?.startsWith("video/") || file.url.match(/\.(mp4|webm|ogg|mov)$/i);
  const isDocument =
    file.type?.startsWith("text/") || file.type?.includes("document");

  const getFileIcon = () => {
    if (isImage)
      return (
        <img
          src={file.url}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      );
    if (isVideo) return <Film className="h-6 w-6 text-primary" />;
    if (isDocument) return <FileText className="h-6 w-6 text-primary" />;
    return <FileText className="h-6 w-6 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Link
      href={`/${file.message?.channel?.workspaceId}/${file.message?.channelId}`}
      className="flex items-start p-3 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex gap-3">
        <div
          className={`h-10 w-10 rounded overflow-hidden flex items-center justify-center ${
            isImage ? "" : "bg-primary/10"
          }`}
        >
          {getFileIcon()}
        </div>
        <div>
          <div className="font-medium">{highlight(file.name)}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(file.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {file.message?.channel && (
            <div className="mt-1 text-xs text-primary flex items-center">
              <Hash className="h-3 w-3 mr-1" />
              {file.message.channel.name}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
