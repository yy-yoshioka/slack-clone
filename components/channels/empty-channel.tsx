"use client";

import {
  MessageSquarePlus,
  PlusCircle,
  Users,
  FileText,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyChannelProps {
  channelName: string;
  isOwner?: boolean;
  onStartTopic?: (topic: string) => void;
}

export function EmptyChannel({
  channelName,
  isOwner = false,
  onStartTopic,
}: EmptyChannelProps) {
  const conversationStarters = [
    {
      title: "Introduce yourself",
      description:
        "Share something about who you are and what you're working on.",
      icon: Users,
    },
    {
      title: "Share resources",
      description:
        "Post articles, links, or tools that might be helpful for the team.",
      icon: FileText,
    },
    {
      title: "Ask a question",
      description: "Need help or advice? The team is here to support you.",
      icon: MessageSquarePlus,
    },
    {
      title: "Coffee chat",
      description:
        "Suggest a quick virtual coffee to get to know someone better.",
      icon: Coffee,
    },
  ];

  const handleStartTopic = (topic: string) => {
    if (onStartTopic) {
      onStartTopic(topic);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-6">
          <MessageSquarePlus className="h-8 w-8 text-purple-600 dark:text-purple-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          This is the beginning of #{channelName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          This channel is brand new! Be the first to start a conversation or add
          some context about what this channel is for.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
        {conversationStarters.map((starter) => (
          <div
            key={starter.title}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 text-left hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
            onClick={() => handleStartTopic(starter.title)}
          >
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                <starter.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{starter.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  {starter.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="mt-8">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add a channel description</span>
          </Button>
        </div>
      )}
    </div>
  );
}
