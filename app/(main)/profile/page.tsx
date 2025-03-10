import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getUserProfile } from "@/lib/actions/profile-actions";

export default async function ProfilePage() {
  const { success, profile } = await getUserProfile();

  if (!success || !profile) {
    redirect("/auth/sign-in");
  }

  const formData = {
    displayName: profile.displayName,
    fullName: profile.fullName,
    email: profile.email,
    imageUrl: profile.avatarUrl,
    title: profile.title,
    bio: profile.bio,
    phoneNumber: profile.phoneNumber,
    timezone: profile.timezone,
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your personal information and profile settings
        </p>
      </div>

      <ProfileForm initialData={formData} />
    </div>
  );
}
