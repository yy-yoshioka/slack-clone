import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Search</h1>
        </div>
        <div className="mt-4 max-w-xl">
          <SearchInput />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 hide-scrollbar hover-scrollbar">
        <SearchResults />
      </div>
    </div>
  );
}
