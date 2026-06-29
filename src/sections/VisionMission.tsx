"use client";

import { useRef } from "react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function VisionMission() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !visionRef.current ||
        !missionRef.current
      )
        return;

      gsap.set([visionRef.current, missionRef.current], {
        opacity: 0,
        y: 60,
      });

      gsap.to(visionRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      gsap.to(missionRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="
        relative

        pt-20
        md:pt-0

        min-h-screen 
        pb-24
        
        overflow-hidden
        bg-[#0f0a09]
      "
    >
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          scale-110
          blur-md
          brightness-[0.45]
        "
      >
        {/* Replace with your own video */}
        <source src="/healthcare.webm" type="video/webm" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-[#4c1711]/30 to-black/60" />
      {/* Content */}
      <div
        className="
          relative
          z-10
          min-h-screen
          px-6
          md:px-10
          lg:px-16

          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            max-w-7xl

            grid
            grid-cols-1
            lg:grid-cols-2

            gap-8
            lg:gap-14

            items-center
          "
        >
          {/* Vision */}
          <div
            ref={visionRef}
            className="
              relative

              rounded-[36px]

              border
              border-white/10

              bg-white/10
              backdrop-blur-2xl

              min-h-[420px]
              h-auto

              p-6
              sm:p-8
              md:p-10
              lg:p-12

              flex
              flex-col
              justify-start

              shadow-[0_8px_40px_rgba(0,0,0,0.25)]

              lg:-translate-y-10
            "
          >
            {/* Small Label */}
            <div className="mb-6">
              <span
                className="
                  text-white/60
                  text-sm
                  md:text-base
                  lg:text-lg
                  uppercase
                  tracking-[0.3em]
                  font-medium
                "
              >
                Our Vision
              </span>
            </div>

            {/* Main Text */}
            <p
              className="
                text-white

                text-[1.6rem]
                sm:text-2xl
                md:text-3xl

                max-w-full
                lg:max-w-[90%]

                mt-4

                font-medium
                tracking-tight
                leading-[1.25]
              "
            >
              To become a trusted digital healthcare platform that connects
              patients, doctors and clinical pharmacists for continuous, safe
              and outcome-focused care.
            </p>
          </div>

          {/* Mission */}
          <div
            ref={missionRef}
            className="
              relative

              rounded-[36px]

              border
              border-white/10

              bg-white/10
              backdrop-blur-2xl

              min-h-[420px]
              h-auto

              p-6
              sm:p-8
              md:p-10
              lg:p-12

              flex
              flex-col
              justify-start

              shadow-[0_8px_40px_rgba(0,0,0,0.25)]

              lg:translate-y-10
            "
          >
            {/* Small Label */}
            <div className="mb-6">
              <span
                className="
                  text-white/60
                  text-sm
                  md:text-base
                  lg:text-lg
                  uppercase
                  tracking-[0.3em]
                  font-medium
                "
              >
                Our Mission
              </span>
            </div>

            {/* Main Text */}
            <p
              className="
                text-white

                text-[1.6rem]
                sm:text-2xl
                md:text-3xl

                max-w-full
                lg:max-w-[90%]

                mt-4

                font-medium
                tracking-tight
                leading-[1.25]
              "
            >
              To improve healthcare outcomes through accessible pharmacist-led
              virtual care, medication management, chronic disease support,
              patient education and preventive health services.
            </p>
          </div>
        </div>
      </div>
      
    </section>
  );
}