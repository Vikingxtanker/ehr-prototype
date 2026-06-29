"use client";

import { useRef } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Introduction() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!textRef.current || !sectionRef.current) return;

    // Split text into words
    const split = new SplitType(textRef.current, {
      types: "words",
    });

    // Initial state
    gsap.set(split.words, {
      opacity: 0.15,
      color: "#4c1711",
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

    // Animate words sequentially
    tl.to(split.words, {
      opacity: 1,
      stagger: 0.15,
      ease: "none",
    });

    return () => {
      split.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative 
        bg-[#f4efee] 
        px-6
        pt-16
        md:pt-0
      "
    >
      <div
        className="
          min-h-screen
          flex
          justify-center

          items-start
          sm:items-center

          pt-20
          sm:pt-0
        "
      >

        <div className="max-w-6xl mx-auto text-center">

          {/* Badge */}
          {/* <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#aa6f73]/15 border border-[#aa6f73]/20">
              <span className="text-sm font-medium tracking-widest text-[#aa6f73] uppercase">
                Introducing Anexra
              </span>
            </div>
          </div> */}

          {/* Main Heading */}
          <div className="max-w-6xl mx-auto text-center">

            <h2
              className="
                text-[1.7rem]
                sm:text-3xl
                md:text-5xl
                lg:text-6xl
                font-medium
                leading-[0.95]
                tracking-tight
              "
            >
              Healthcare deserves connected long-term care.
            </h2>

            <div className="relative mt-4 sm:mt-10">
              <div className="absolute inset-0 rounded-[40px] overflow-hidden z-0">
                <div className="animated-gradient gradient-1" />
                <div className="animated-gradient gradient-2" />
                <div className="animated-gradient gradient-3" />
              </div>

              <div
                className="
                  relative
                  z-10
                  rounded-[40px]
                  border border-white/40
                  bg-white/5
                  backdrop-blur-2xl
                  p-4 sm:p-8 md:p-16
                "
              >
                <p
                  ref={textRef}
                  className="
                    text-[#4c1711]
                    text-[1.4rem]
                    sm:text-[2rem]
                    md:text-[3rem]
                    leading-[1.05]
                    font-medium
                  "
                >
                  Smarter chronic care, seamless patient follow-ups,
                  and connected long-term healthcare support.
                </p>
              </div>
            </div>

            <h2
              className="
                mt-4 sm:mt-10
                text-[1.7rem]
                sm:text-3xl
                md:text-5xl
                lg:text-6xl
                font-medium
                leading-[0.95]
                tracking-tight
                text-[#4c1711]
              "
            >
              That's why we built Anexra.
            </h2>

          </div>
        </div>
      </div>
    </section>
  );
}