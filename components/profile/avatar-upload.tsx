"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { uploadAvatar } from "@/lib/actions/profile-actions";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentImageUrl: string | null;
  name: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({
  currentImageUrl,
  name,
  onAvatarChange,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get user initials for avatar fallback
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      setIsUploading(true);
      const result = await uploadAvatar(file);
      console.log(result);

      if (result.success && result.avatarUrl) {
        toast.success("Avatar updated successfully");
        onAvatarChange(result.avatarUrl);
      } else {
        toast.error(result.error || "Failed to upload avatar");
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error("Something went wrong");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || currentImageUrl || undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        {previewUrl && (
          <button
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            onClick={cancelPreview}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </div>
    </div>
  );
}
