"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/components/files/file-item";
import { Button } from "@/components/ui/button";
import {
  getWorkspaceFiles,
  getChannelFiles,
  getUserFiles,
} from "@/lib/actions/file-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, FileText, User, Folder } from "lucide-react";

type FileView = "all" | "channel" | "my";
type SortOption = "date" | "name" | "size";
type SortDirection = "asc" | "desc";

interface FileBrowserProps {
  workspaceId: string;
  channelId?: string;
}

export function FileBrowser({ workspaceId, channelId }: FileBrowserProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<FileView>(channelId ? "channel" : "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      let result;

      if (view === "channel" && channelId) {
        result = await getChannelFiles(channelId);
      } else if (view === "my") {
        result = await getUserFiles(workspaceId);
      } else {
        result = await getWorkspaceFiles(workspaceId);
      }

      if (result.success) {
        setFiles(result.files);
      } else {
        console.error("Error loading files:", result.error);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadFiles();
  }, [workspaceId, channelId, view]);

  const handleDelete = () => {
    loadFiles();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sortFiles = (files: any[]) => {
    return [...files].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "size") {
        comparison = a.size - b.size;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = sortFiles(filteredFiles);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as FileView)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all" disabled={isLoading}>
              <Folder className="h-4 w-4 mr-2" />
              All Files
            </TabsTrigger>
            {channelId && (
              <TabsTrigger value="channel" disabled={isLoading}>
                <FileText className="h-4 w-4 mr-2" />
                Channel Files
              </TabsTrigger>
            )}
            <TabsTrigger value="my" disabled={isLoading}>
              <User className="h-4 w-4 mr-2" />
              My Files
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search files..."
              className="pl-9 w-full sm:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="p-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            <Button variant="outline" size="sm" onClick={toggleSortDirection}>
              {sortDirection === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No files found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "Try a different search term"
              : view === "my"
              ? "You haven't uploaded any files yet"
              : "No files have been uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFiles.map((file) => (
            <FileItem key={file.id} file={file} onDelete={handleDelete} />
          ))}

          <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
            Showing {sortedFiles.length} file
            {sortedFiles.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
