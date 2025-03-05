import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

<div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
  <Link href={`/${workspaceId}/search`} className="w-full">
    <Button
      variant="outline"
      className="w-full text-muted-foreground justify-start text-sm"
    >
      <SearchIcon className="mr-2 h-4 w-4" />
      Search in workspace
    </Button>
  </Link>
</div>;
