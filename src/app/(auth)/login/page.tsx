import type { Metadata } from "next";
import {
  Lock,
  User,
} from "lucide-react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Anexra EHR",
  description: "Electronic Health Record Prototype",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">

      <Image
            src="/images/hospital-bg.webp"
            alt="Hospital"
            fill
            priority
            className="object-cover object-bottom blur-[1.5px] scale-100"
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
              className="mt-8 max-w-lg text-lg text-white/90"
              style={{
                textShadow: "0 2px 15px rgba(0,0,0,.8)",
              }}
            >
              Smart Care. Better Outcomes. Stronger Together.
            </p>

          </div>

        </div>

        {/* Right Side */}

        <div className="
          lg:col-span-5
          flex
          items-center
          justify-center
          px-6
          sm:px-10
          lg:px-16
          bg-transparent
          lg:bg-white/90
          lg:backdrop-blur-xl
          "
        >

          <div
            className="
              w-full
              max-w-md

              rounded-3xl
              bg-white/15
              backdrop-blur-xs
              shadow-2xl
              p-8

              lg:rounded-none
              lg:bg-transparent
              lg:backdrop-blur-none
              lg:shadow-none
              lg:p-0
            "
          >

            <div className="mb-8 text-center">

            <div className="mb-8 text-center lg:hidden">

              <Image
                src="/anexra-wordmark-white.svg"
                alt="Anexra"
                width={180}
                height={50}
                className="mx-auto"
              />

            </div>

              <h2 className="text-4xl font-bold text-white lg:text-[#2b0b08]">
                  Welcome Back
              </h2>

              <p className="mt-2 text-white/80 lg:text-[#7f7072]">
                  Sign in to continue
              </p>

            </div>

            <div className="space-y-5">

              <div className="relative">

                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                <Input
                    className="
                        h-13
                        rounded-2xl
                        border-[#ddc5c7]
                        bg-white/80
                        pl-12
                        transition-all
                        focus-visible:ring-[#87565b]
                        focus-visible:border-[#87565b]
                    "
                    placeholder="Username"
                />

              </div>

              <div className="relative">

                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                <Input
                  className="
                      h-13
                      rounded-2xl
                      border-[#ddc5c7]
                      bg-white/80
                      pl-12
                      transition-all
                      focus-visible:ring-[#87565b]
                      focus-visible:border-[#87565b]
                  "
                  placeholder="Password"
              />

              </div>

              <Button
                asChild
                variant="anexra"
                size="xl"
                className="w-full"
              >
                <Link href="/dashboard">
                  Login
                </Link>
              </Button>

            </div>

            <div className="
              mt-8
              rounded-3xl
              border
              border-[#ece1e2]
              bg-[#fcfaf9]
              p-6
              "
            >

              <p className="mb-2 font-semibold text-[#2b0b08]">
                Demo Accounts
              </p>

              <div className="space-y-1 text-sm text-slate-600 text-[#7f7072]">

                <p>Doctor</p>

                <p>Nurse</p>

                <p>Pharmacist</p>

                <p>Receptionist</p>

                <p>Administrator</p>

              </div>

            </div>

            <p className="mt-8 text-center text-xs text-[#9d8f91]">

              © 2026 Anexra EHR Prototype
              <br />
              v0.1 alpha

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}