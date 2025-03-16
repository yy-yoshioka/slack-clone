import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { Info, Users, Paperclip, AtSign, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ChannelPageProps {
  params: {
    workspaceId: string;
    channelId: string;
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const channelName = "general"; // TODO: Get from database
  const description =
    "This channel is for team-wide communication and announcements. All team members are in this channel.";
  const isNewChannel = true; // This would be determined based on channel creation date or user join date

  return (
    <div className="flex flex-col h-full">
      {isNewChannel ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                <span className="text-3xl" role="img" aria-label="wave emoji">
                  👋
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome to #{channelName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <AtSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Mention others</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use @ to mention specific people or everyone in this
                      channel
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Share files</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drag and drop files or use the attachment button to share
                      them
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Set notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize when and how you receive notifications from this
                      channel
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                    <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Channel settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set topic, privacy, and other channel preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" className="gap-2" asChild>
                <Link
                  href={`/${params.workspaceId}/${params.channelId}/details`}
                >
                  <Info className="h-4 w-4" />
                  Channel details
                </Link>
              </Button>

              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Users className="h-4 w-4" />
                Invite others
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <MessageList
            workspaceId={params.workspaceId}
            channelId={params.channelId}
            userId="current-user" // This should come from authentication
          />
        </div>
      )}

      <div className="p-4 border-t">
        <MessageInput
          channelId={params.channelId}
          suggestions={[
            "What's on your mind?",
            "Any updates to share with the team?",
            "Ask a question...",
          ]}
        />
      </div>
    </div>
  );
}
