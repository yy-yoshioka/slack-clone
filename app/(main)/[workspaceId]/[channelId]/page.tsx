import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { Hash, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ChannelPageProps {
  params: {
    workspaceId: string;
    channelId: string;
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const channelName = "social"; // TODO: Get from database
  const description =
    "Other channels are for work. This one's just for fun. Get to know your teammates and show your lighter side. 🎉";
  const memberCount = 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">{channelName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/${params.workspaceId}/${params.channelId}/details`}>
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href={`/${params.workspaceId}/${params.channelId}/members`}>
              <Users className="h-4 w-4" />
              <span>{memberCount}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 border-b bg-muted/50">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex-1 overflow-auto">
        <MessageList />
      </div>

      <div className="p-4 border-t">
        <MessageInput
          channelId={params.channelId}
          suggestions={[
            "What's brought you joy lately?",
            "If you could be any animal...",
          ]}
        />
      </div>
    </div>
  );
}
