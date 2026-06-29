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
      types: "chars",
    });

    if (!split.chars) return;

    gsap.set(split.chars, {
      opacity: 0.15,
      color: "#4c1711",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=1000",
        scrub: true,
        pin: true,
      },
    });

    split.chars.forEach((char, i) => {
      tl.to(
        char,
        {
          opacity: 1,
          duration: 0.05,
          ease: "none",
        },
        i * 0.05
      );
    });

    return () => {
      split.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f4efee] px-6"
    >
      <div className="h-screen flex items-center justify-center">

        <div className="max-w-6xl mx-auto text-center">

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#aa6f73]/15 border border-[#aa6f73]/20">
              <span className="text-sm font-medium tracking-widest text-[#aa6f73] uppercase">
                Introducing Anexra
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight max-w-6xl mx-auto">

            <span className="block text-[#4c1711] mb-10">
              Healthcare deserves connected long-term care
            </span>

            {/* Animated Text */}
            <p
              ref={textRef}
              className="text-[#4c1711] inline leading-[1.15]"
            >
              End to End Healthcare Solutions
            </p>

            <span className="block text-[#4c1711] mt-10">
              That&apos;s why we built Anexra.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}