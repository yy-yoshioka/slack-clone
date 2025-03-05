"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type FileUploadProps = {
  onFileUpload: (url: string, name: string, size: number, type: string) => void;
};

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    try {
      // Generate a unique file path with timestamp and random string
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileName = `${randomString}_${timestamp}.${fileExt}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage error:", error);
        throw new Error(error.message);
      }

      // Get public URL - make sure your bucket has public access enabled
      const { data: publicUrlData } = supabase.storage
        .from("files")
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Notify parent component
      onFileUpload(publicUrlData.publicUrl, file.name, file.size, file.type);

      toast.success("File uploaded successfully");

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        `Failed to upload file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Paperclip className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Attach"}
      </Button>
    </div>
  );
}
