import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 w-full max-w-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ve sent a verification email to your address. Please check
            your inbox and click the verification link to complete your
            registration.
          </p>
        </div>

        <div className="text-center">
          <Link href="/auth/sign-in">
            <Button>Return to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
