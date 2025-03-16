"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createChannel } from "@/lib/actions/channel-actions";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .refine((name) => /^[a-z0-9-]+$/.test(name.toLowerCase()), {
      message:
        "Channel name can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type ChannelCreateFormProps = {
  workspaceId: string;
};

export function ChannelCreateForm({ workspaceId }: ChannelCreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createChannel(workspaceId, values);

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push(`/${workspaceId}/${result.channelId}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create channel"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Name</FormLabel>
                <FormControl>
                  <Input placeholder="general" {...field} />
                </FormControl>
                <FormDescription>
                  Use lowercase letters, numbers, and hyphens only.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What is this channel about?"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional brief description of the channel&apos;s purpose.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Private Channel</FormLabel>
                  <FormDescription>
                    Private channels are only visible to invited members.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Channel..." : "Create Channel"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
