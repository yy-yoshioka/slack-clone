"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Hash, Info } from "lucide-react";

interface CreateChannelPageProps {
  params: {
    workspaceId: string;
  };
}

export default function CreateChannelPage({ params }: CreateChannelPageProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, "-");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from("channels")
        .insert({
          name: normalizedName,
          description: description.trim(),
          workspace_id: params.workspaceId,
          is_private: isPrivate,
          created_by: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add creator as channel member
      await supabase.from("channel_members").insert({
        channel_id: channel.id,
        user_id: user.id,
      });

      toast({
        title: "Success",
        description: `Channel #${normalizedName} created successfully`,
      });

      // Redirect to the new channel
      router.push(`/workspace/${params.workspaceId}/channel/${channel.id}`);
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Create a channel
        </h1>
        <p className="text-gray-600">
          Channels are where your team communicates. They&apos;re best when
          organized around a topic — #marketing, for example.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Channel name */}
          <div>
            <label
              htmlFor="channel-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                placeholder="e.g. marketing"
                maxLength={80}
              />
            </div>
            {name && (
              <p className="mt-2 text-sm text-gray-600">
                Your channel will be called{" "}
                <span className="font-medium">#{normalizedName}</span>
              </p>
            )}
          </div>

          {/* Channel description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="channel-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <span className="text-xs text-gray-500">
                {description.length}/250
              </span>
            </div>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="resize-none"
              maxLength={250}
            />
          </div>

          {/* Privacy setting */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#1264A3] focus:ring-[#1264A3]"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="private" className="font-medium text-gray-700">
                  Make private
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  When a channel is set to private, it can only be viewed or
                  joined by invitation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <Info className="h-4 w-4 mr-1" />
                <span>Anyone in your workspace can join this channel</span>
              </div>
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
