import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function AuthPage() {
  // Redirect to sign-in by default
  redirect("/auth/sign-in");
}
