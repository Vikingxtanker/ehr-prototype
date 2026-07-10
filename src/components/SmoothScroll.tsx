"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Desktop only
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis({
      duration: 0.6,
      smoothWheel: true,
      wheelMultiplier: 1.2,

      allowNestedScroll: true,

      easing: (t) => 1 - Math.pow(1 - t, 6),

      prevent: (node) =>
        Boolean(
          node.closest("[data-lenis-prevent]")
        ),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}