"use client";

import { useState } from "react";

import PharmaConnectModal from "@/components/pharma-connect-modal";

import { Button } from "@/components/ui/button";

export default function Hero() {

  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-start md:items-center pt-24 md:pt-0 px-4 sm:px-6">
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="
            w-full h-full object-cover
            object-[78%_center] 
            md:object-center
            scale-125 md:scale-110
            opacity-[0.45]
          "
        >
          <source src="/hero_background.webm" type="video/webm" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#f4efee]/30 backdrop-blur-[1px] pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto text-center py-16 sm:py-24 md:py-32">

        {/* Heading */}
        <h1
          className="
            font-semibold tracking-tight text-[#4c1711]
            leading-none
            sm:leading-[0.9]
            text-[clamp(2.5rem,8vw,6rem)]
            max-w-5xl mx-auto
          "
        >
          Next-Gen Assistance
          <br />
          for Modern Healthcare
        </h1>

        {/* Subtext */}
        <p
          className="
            mt-6 sm:mt-8
            text-[0.95rem]
            sm:text-lg
            md:text-xl
            text-[#564740]/80
            max-w-md
            sm:max-w-2xl
            md:max-w-3xl
            mx-auto
            leading-relaxed
            px-2
          "
        >
          Anexra bridges clinical pharmacy, patient care, and digital
          healthcare solutions to support hospitals, chronic care management,
          medication safety, and healthcare education through innovative
          technology-driven services.
        </p>

        {/* Pharma Connect CTA */}
        <div className="mt-12 flex flex-col items-center gap-5">
          <Button
            type="button"
            onClick={() => setIsNetworkOpen(true)}
            size="lg"
            className="
              w-full
              max-w-sm
              h-14
              sm:h-16

              text-base
              sm:text-lg
              rounded-full
              bg-gradient-to-r
              from-[#aa6f73]
              to-[#c78d91]
              text-white
              font-semibold
              shadow-[0_10px_35px_rgba(170,111,115,0.35)]
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-[0_15px_45px_rgba(170,111,115,0.5)]
              active:scale-95
            "
          >
            Join Pharma Connect
          </Button>

          <p
            className="
              mt-4
              text-sm sm:text-base
              text-[#564740]/70
              max-w-xl
              text-center
            "
          >
            Connect with pharmacy students, graduates, educators, and healthcare
            professionals across India.
          </p>
        </div>

        <PharmaConnectModal
          open={isNetworkOpen}
          onOpenChange={setIsNetworkOpen}
        />

      </div>
    </section>
  );
}