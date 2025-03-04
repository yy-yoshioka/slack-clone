import { redirect } from "next/navigation";

export default function AuthPage() {
  // Redirect to sign-in by default
  redirect("/auth/sign-in");
}
