"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const solutions = [
  {
    title: "End to End Hospital Solutions",
    description:
    "Complete hospital management solutions including EHR, patient registration, billing, pharmacy, laboratory, and clinical workflows.",
    href: "/solutions/end-to-end-hospital-solutions",
    image:
      "/images/solutions/ETEHS.webp",
    large: true,
  },
  {
    title: "Clinical Pharmacist-Led Care",
    description:
      "Personalized medication management and patient-centered pharmaceutical care.",
    href: "/solutions/clinical-pharmacist-led-care",
    image:
      "/images/solutions/pharmacist-led-care.webp",
    large: true,
  },
  {
    title: "Chronic Care Management",
    description:
      "Continuous healthcare coordination for long-term patient outcomes.",
    href: "/solutions/chronic-care-management",
    image:
      "/images/solutions/chronic-care-management.webp",
  },
  {
    title: "Clinical Education",
    description:
      "Healthcare awareness programs and professional education initiatives.",
    href: "/solutions/clinical-education",
    image:
      "/images/solutions/pharmacy-education.webp",
  },
  {
    title: "Remote Monitoring",
    description:
      "Digital patient monitoring for proactive healthcare interventions.",
    href: "/solutions/remote-monitoring",
    image:
      "/images/solutions/remote-patient-monitoring.webp",
    large: true,
  },
  {
    title: "Medication Therapy",
    description:
      "Optimized medication therapy management for safer treatment plans.",
    href: "/solutions/medication-therapy",
    image:
      "/images/solutions/medication-therapy-management.webp",
  },
  {
    title: "Insurance Support",
    description:
      "Care navigation and insurance assistance for better accessibility.",
    href: "/solutions/insurance-support",
    image:
      "/images/solutions/insurance-support.webp",
  },
  {
    title: "Pharmaceutical Company",
    description:
      "Strategic healthcare and pharmaceutical industry collaboration.",
    href: "/solutions/pharmaceutical-company",
    image:
      "/images/solutions/pharmaceutical-company.webp",
  },
  {
    title: "Medication Adherence",
    description:
      "Improving patient adherence through reminders and care tracking.",
    href: "/solutions/medication-adherence",
    image:
      "/images/solutions/medication-adherence.webp",
  },
  {
    title: "Medical Tourism",
    description:
      "Global healthcare coordination and international patient assistance.",
    href: "/solutions/medical-tourism",
    image:
      "/images/solutions/medical-tourism.webp",
  },
  {
    title: "Preventive Wellness",
    description:
      "Annual wellness programs focused on prevention and early intervention.",
    href: "/solutions/preventive-wellness",
    image:
      "/images/solutions/patient-counseling.webp",
  },
];

export default function Solutions() {
  const mobileSectionRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (
      !mobileTrackRef.current ||
      !mobileSectionRef.current
    )
      return;

    // Mobile only
    if (window.innerWidth >= 768) return;

    const totalWidth =
      mobileTrackRef.current.scrollWidth -
      window.innerWidth;

    const tween = gsap.to(mobileTrackRef.current, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: mobileSectionRef.current,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* DESKTOP + TABLET */}
      <div className="max-w-7xl mx-auto relative z-10 px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-[#4c1711] max-w-5xl mx-auto">
            Our Solutions
          </h2>
        </div>

        {/* Desktop Bento Grid */}
        <div className="hidden lg:grid grid-cols-4 auto-rows-[260px] gap-6">
          {solutions.map((solution, index) => {
            return (
              <Link
                key={index}
                href={solution.href}
                className={`group relative overflow-hidden rounded-[32px] border border-white/20 bg-white/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(76,23,17,0.08)] ${
                  solution.large
                    ? "col-span-2 row-span-2"
                    : "col-span-1 row-span-1"
                }`}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${solution.image})`,
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f4efee]/70 via-[#f4efee]/40 to-[#4c1711]/50 group-hover:from-[#4c1711]/70 group-hover:to-[#aa6f73]/70 transition-all duration-500" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-7">

                  <div>
                    <h3 className="text-2xl font-semibold text-[#4c1711] group-hover:text-white transition-colors duration-300 leading-tight">
                      {solution.title}
                    </h3>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm leading-relaxed text-white/90 max-w-sm">
                        {solution.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white">
                        Explore More
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5">
          {solutions.map((solution, index) => {
            return (
              <Link
                key={index}
                href={solution.href}
                className="group relative h-[420px] overflow-hidden rounded-[32px] border border-white/20 bg-white/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(76,23,17,0.08)]"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${solution.image})`,
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#f4efee]/20 via-[#4c1711]/20 to-[#4c1711]/80" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-7">
                  <h3 className="text-3xl font-semibold text-white leading-tight">
                    {solution.title}
                  </h3>

                  <p className="mt-4 text-white/80 text-sm leading-relaxed">
                    {solution.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white">
                    Explore More
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE GSAP HORIZONTAL SCROLL */}
      <div
        ref={mobileSectionRef}
        className="md:hidden relative h-screen overflow-hidden"
      >
        <div
          ref={mobileTrackRef}
          className="flex flex-nowrap h-screen"
        >
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="w-screen h-screen flex-shrink-0 flex items-center justify-center px-4"
            >
              <Link
                href={solution.href}
                className="
                group relative overflow-hidden
                rounded-[32px]
                border border-white/20
                bg-white/30
                backdrop-blur-xl
                shadow-[0_8px_30px_rgba(76,23,17,0.08)]

                w-[88vw]
                h-[82svh]

                min-h-[420px]
                max-h-[900px]
                "
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${solution.image})`,
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#f4efee]/20 via-[#4c1711]/20 to-[#4c1711]/80" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-semibold text-white leading-tight">
                    {solution.title}
                  </h3>

                  <p className="mt-3 text-white/80 text-sm leading-relaxed">
                    {solution.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white">
                    Explore More
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}