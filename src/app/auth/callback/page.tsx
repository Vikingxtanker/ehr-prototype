"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {

    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          router.replace("/student/login");
          return;
        }

        router.replace("/student/dashboard");

      } catch (error) {
        console.error(
          "CALLBACK ERROR:",
          error
        );

        router.replace(
          "/student/login"
        );
      }
    };

    // slight delay lets supabase
    // restore hash session
    setTimeout(() => {
      handleAuthCallback();
    }, 1000);

  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F] text-white">
      <p className="text-lg font-medium">
        Verifying your email...
      </p>
    </div>
  );
}