"use client";

import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const points = [
  "Clinical Pharmacist-led care",
  "Patient-centered support",
  "Technology-enabled monitoring",
  "Medication safety focus",
  "Better care coordination",
];

export default function WhyAnexra() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !headingRef.current ||
        !cardsWrapperRef.current
      )
        return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const cards = cardsRef.current.filter(Boolean);

        // Initial states
        gsap.set(cardsWrapperRef.current, {
          opacity: 0,
          x: 120,
        });

        gsap.set(cards, {
          opacity: 0,
          y: 40,
        });

        // Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=2500",
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });

        // PHASE 1
        // Heading moves left
        tl.to(headingRef.current, {
          x: "-30vw",
          scale: 0.5,
          ease: "none",
          duration: 1,
        });

        // PHASE 2
        // Cards wrapper fades in
        tl.to(
          cardsWrapperRef.current,
          {
            opacity: 1,
            x: 0,
            ease: "none",
            duration: 0.5,
          },
          "-=0.2"
        );

        // PHASE 3
        // Cards reveal one by one
        cards.forEach((card) => {
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "none",
            },
            "-=0.1"
          );
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f4efee] overflow-hidden"
    >
      {/* DESKTOP */}
      <div className="hidden md:block relative h-[100svh] w-full">

        <div className="relative mx-auto h-full w-full max-w-7xl">

          {/* Heading */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2
              ref={headingRef}
              className="
                text-[#4c1711]
                font-semibold
                tracking-tight
                leading-[0.85]
                text-center
                will-change-transform

                text-7xl
                lg:text-[10rem]
                xl:text-[12rem]
              "
            >
              Why
              <br />
              Anexra?
            </h2>
          </div>

          {/* Cards */}
          <div
            ref={cardsWrapperRef}
            className="
              absolute
              top-1/2
              -translate-y-1/2

              md:right-8
              lg:right-0

              md:w-[38vw]
              lg:w-[42vw]
              max-w-[620px]

              flex
              flex-col
              gap-6
            "
          >
            {points.map((point, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="
                  rounded-[32px]
                  border border-[#aa6f73]/15
                  bg-white/50
                  backdrop-blur-xl

                  px-8
                  py-7

                  shadow-[0_8px_30px_rgba(76,23,17,0.05)]
                "
              >
                <p
                  className="
                    text-[#4c1711]
                    text-2xl
                    font-medium
                    tracking-tight
                    leading-snug
                  "
                >
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden min-h-screen px-6 py-24">

        <h2
          className="
            text-[#4c1711]
            font-semibold
            tracking-tight
            leading-[0.9]

            text-5xl
            mb-12
          "
        >
          Why
          <br />
          Anexra?
        </h2>

        <div className="flex flex-col gap-5">
          {points.map((point, index) => (
            <div
              key={index}
              className="
                rounded-[28px]
                border border-[#aa6f73]/15
                bg-white/40
                backdrop-blur-xl

                px-6
                py-5

                shadow-[0_8px_30px_rgba(76,23,17,0.05)]
              "
            >
              <p
                className="
                  text-[#4c1711]
                  text-lg
                  font-medium
                  tracking-tight
                  leading-snug
                "
              >
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}