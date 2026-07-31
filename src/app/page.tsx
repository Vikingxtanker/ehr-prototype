import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";

import Image from "next/image";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Anexra EHR",
  description: "Electronic Health Record Prototype",
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">

      <Image
        src="/images/hospital-bg.webp"
        alt="Hospital"
        fill
        priority
        className="scale-100 object-cover object-bottom blur-[1.5px]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#2b0b08]/90 via-[#2b0b08]/70 to-black/40" />

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 lg:grid-cols-12">

        {/* Left Side */}

        <div className="relative hidden lg:col-span-7 lg:flex flex-col justify-center overflow-hidden px-24 py-20 text-white">

          <div className="relative z-10 max-w-xl">

            <div className="mb-12">
              <Image
                src="/anexra-wordmark-white.svg"
                alt="Anexra"
                width={500}
                height={120}
                priority
                className="h-24 w-auto"
              />
            </div>

            <h2
              className="text-5xl font-bold leading-tight text-white"
              style={{
                textShadow: "0 4px 25px rgba(0,0,0,.9)",
              }}
            >
              Electronic
              <br />
              Healthcare Record
            </h2>

            <p
              className="mt-8 flex max-w-lg items-center gap-3 text-lg text-white/90"
              style={{
                textShadow: "0 2px 15px rgba(0,0,0,.8)",
              }}
            >
              <HeartPulse className="h-6 w-6 shrink-0" />

              Smart Care. Better Outcomes. Stronger Together.
            </p>

          </div>

        </div>

        {/* Right Side */}

        <div
          className="
            lg:col-span-5
            flex
            items-center
            justify-center
            bg-transparent
            px-6
            sm:px-10
            lg:bg-white/90
            lg:px-16
            lg:backdrop-blur-xl
          "
        >

          <LoginForm />

        </div>

      </div>

    </main>
  );
}
