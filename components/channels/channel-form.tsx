"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createChannel } from "@/lib/actions/channel-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(80, "Channel name cannot exceed 80 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Only letters, numbers, hyphens, and underscores are allowed"
    ),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type ChannelFormProps = {
  workspaceId: string;
  onSuccess?: (channelId: string) => void;
  trigger?: React.ReactNode;
};

export function ChannelForm({
  workspaceId,
  onSuccess,
  trigger,
}: ChannelFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

      form.reset();
      setDialogOpen(false);

      if (onSuccess) {
        onSuccess(result.channelId ?? "");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create channel"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Name</FormLabel>
              <FormControl>
                <Input placeholder="general" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Use lowercase letters, numbers, hyphens, and underscores only.
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's this channel about?"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
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
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Private Channel</FormLabel>
                <FormDescription>
                  Private channels are only visible to invited members
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Channel"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // If there's a custom trigger, render in dialog mode
  if (trigger) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, render inline
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Create a Channel</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create a new channel in this workspace
        </p>
      </div>
      {content}
    </div>
  );
}
