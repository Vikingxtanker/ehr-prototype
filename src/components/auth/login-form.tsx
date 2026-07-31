"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Lock, LogIn, User } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DEMO_CREDENTIALS,
  getSession,
  initSession,
  login,
} from "@/lib/auth/demo-auth";

export function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initSession();

    if (getSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const session = login(username, password);

    if (!session) {
      setError("Invalid username or password.");
      return;
    }

    setIsSubmitting(true);

    router.replace("/dashboard");
  }

  return (
    <div
      className="
        w-full
        max-w-md
        rounded-3xl
        bg-white/15
        p-8
        shadow-2xl
        backdrop-blur-xs
        lg:rounded-none
        lg:bg-transparent
        lg:p-0
        lg:shadow-none
      "
    >
      <div className="mb-8 text-center lg:hidden">
        <Image
          src="/anexra-wordmark-white.svg"
          alt="Anexra"
          width={180}
          height={50}
          priority
          className="mx-auto"
        />
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white lg:text-[#2b0b08]">
          Welcome Back
        </h2>

        <p className="mt-2 text-white/80 lg:text-[#7f7072]">
          Sign in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="relative">
          <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

          <Input
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="
              h-13
              rounded-2xl
              border-[#ddc5c7]
              bg-white/80
              pl-12
              transition-all
              focus-visible:border-[#87565b]
              focus-visible:ring-[#87565b]
            "
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="
              h-13
              rounded-2xl
              border-[#ddc5c7]
              bg-white/80
              pl-12
              transition-all
              focus-visible:border-[#87565b]
              focus-visible:ring-[#87565b]
            "
          />
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="anexra"
          size="xl"
          disabled={isSubmitting}
          className="w-full cursor-pointer"
        >
          <LogIn />

          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </form>

      <div className="mt-8 rounded-3xl border border-[#ece1e2] bg-[#fcfaf9] p-5">
        <p className="text-sm text-[#7f7072]">
          Demo credentials — username{" "}
          <span className="font-semibold text-[#4c1711]">
            {DEMO_CREDENTIALS.username}
          </span>{" "}
          and password{" "}
          <span className="font-semibold text-[#4c1711]">
            {DEMO_CREDENTIALS.password}
          </span>
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-[#9d8f91]">
        © 2026 Anexra EHR Prototype
      </p>
    </div>
  );
}
