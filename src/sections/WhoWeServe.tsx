"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const whoWeServe = [
  {
    title: "Hospital & Health Systems",
    description:
      "Integrated pharmaceutical and clinical support for hospitals and healthcare networks.",
    href: "#",
    image:
      "/images/solutions/pharmaceutical-company.webp",
  },
  {
    title: "Physicians",
    description:
      "Collaborative care solutions supporting physicians and medical practices.",
    href: "#",
    image:
      "/images/solutions/chronic-care-management.webp",
  },
  {
    title: "Healthcare Training Institutes",
    description:
      "Clinical education, training, and healthcare workforce development programs.",
    href: "#",
    image:
      "/images/solutions/pharmacy-education.webp",
  },
  {
    title: "Insurance Companies",
    description:
      "Healthcare coordination and medication management support for insurers.",
    href: "#",
    image:
      "/images/solutions/insurance-support.webp",
  },
  {
    title: "Pharmaceutical Companies",
    description:
      "Strategic partnerships for pharmaceutical innovation and patient care initiatives.",
    href: "#",
    image:
      "/images/solutions/pharmaceutical-company.webp",
  },
  {
    title: "Healthcare Payors",
    description:
      "Value-based healthcare collaboration and population health optimization.",
    href: "#",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Post-Acute Care Centers",
    description:
      "Medication therapy management and continuity of care for rehabilitation facilities.",
    href: "#",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function WhoWeServe() {
  const sectionRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  if (!sectionRef.current) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    const cards =
      gsap.utils.toArray<HTMLElement>(".serve-card");

    cards.forEach((card, index) => {
      gsap.set(card, {
        opacity: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : 0.92,
        y: index === 0 ? 0 : 120,
        zIndex: cards.length - index,
      });

      gsap.set(card.querySelector(".serve-image"), {
        scale: 1,
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${cards.length * 1400}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card, index) => {
      if (index === cards.length - 1) return;

      const nextCard = cards[index + 1];

      tl.to(
        card.querySelector(".serve-image"),
        {
          scale: 1.08,
          duration: 1,
          ease: "none",
        },
        index * 2
      );

      tl.to(
        card,
        {
          opacity: 0,
          scale: 0.95,
          y: -80,
          duration: 1,
          ease: "power2.out",
        },
        index * 2 + 0.8
      );

      tl.to(
        nextCard,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        index * 2 + 0.8
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  });

  return () => mm.revert();
}, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f4efee] overflow-hidden lg:h-screen"
    >
      {/* ========================= */}
      {/* DESKTOP */}
      {/* ========================= */}
      <div className="hidden lg:flex h-screen max-w-7xl mx-auto px-8 relative z-10">
        
        {/* LEFT PANEL */}
        <div className="w-[35%] flex flex-col justify-center pr-10">

          <h2 className="text-6xl xl:text-7xl font-semibold leading-[0.92] tracking-tight text-[#4c1711]">
            Who We
            <br />
            Serve
          </h2>

          <p className="mt-8 text-[#6f4d49] text-lg leading-relaxed max-w-md">
            Empowering healthcare organizations through innovative clinical,
            pharmaceutical, and digital healthcare solutions.
          </p>
        </div>

        {/* RIGHT STACK */}
        <div className="relative w-[65%] h-screen flex items-center justify-center">
          {whoWeServe.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="
                serve-card
                absolute
                w-full
                max-w-4xl
                h-[78vh]
                overflow-hidden
                rounded-[40px]
                border border-white/20
                bg-white/30
                backdrop-blur-xl
                shadow-[0_10px_40px_rgba(76,23,17,0.12)]
              "
            >
              {/* Image */}
              <div
                className="serve-image absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${item.image})`,
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f4efee]/10 via-[#4c1711]/20 to-[#4c1711]/85" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-5xl font-semibold text-white leading-[1] max-w-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-6 text-white/80 text-lg leading-relaxed max-w-xl">
                    {item.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-white font-medium">
                    Explore More
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </motion.div>
              </div>
            </Link>
          ))}
        </div>
      </div>

{/* ========================= */}
{/* TABLET */}
{/* ========================= */}
<div className="hidden md:block lg:hidden max-w-7xl mx-auto px-6 py-28">

  {/* Tablet Heading */}
  <div className="mb-14">

    <h2 className="text-6xl font-semibold leading-[0.95] tracking-tight text-[#4c1711]">
      Who We Serve
    </h2>

    <p className="mt-6 text-[#6f4d49] text-lg leading-relaxed max-w-2xl">
      Empowering healthcare organizations through innovative clinical,
      pharmaceutical, and digital healthcare solutions.
    </p>
  </div>

  {/* Tablet Grid */}
  <div className="grid grid-cols-2 gap-5">
    {whoWeServe.map((item, index) => (
      <Link
        key={index}
        href={item.href}
        className="group relative h-[420px] overflow-hidden rounded-[32px] border border-white/20 bg-white/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(76,23,17,0.08)]"
      >
        {/* Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-700"
          style={{
            backgroundImage: `url(${item.image})`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4efee]/20 via-[#4c1711]/20 to-[#4c1711]/80" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-7">
          <h3 className="text-3xl font-semibold text-white leading-tight">
            {item.title}
          </h3>

          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            {item.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white">
            Explore More
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>

      {/* ========================= */}
      {/* MOBILE */}
      {/* ========================= */}
      <div className="md:hidden px-4 py-16 space-y-6">
        <div className="mb-10">

          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight text-[#4c1711]">
            Who We Serve
          </h2>
        </div>

        {whoWeServe.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="group relative overflow-hidden rounded-[30px] h-[75svh] min-h-[500px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${item.image})`,
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-[#f4efee]/10 via-[#4c1711]/20 to-[#4c1711]/90" />

            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <h3 className="text-3xl font-semibold text-white leading-tight">
                {item.title}
              </h3>

              <p className="mt-4 text-white/80 text-sm leading-relaxed">
                {item.description}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white">
                Explore More
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}