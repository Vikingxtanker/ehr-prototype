"use client";

import { motion } from "framer-motion";

const hospitals = [
  "Shwas Children Hospital, Latur",
  "Birajdar Memorial Hospital, Latur",
  "Komal Hospital, Udgir",
  "Flora Hospital, Ravet",
  "24 Bliss Hospital, Ravet",
  "Lotus Hospital, Pune",
  "The Health Clinic, Ravet",
  "Prabhavati Hospital, Latur",
];

const pharmaCompanies = [
  "Doyen Healthcare, Pune",
  "Macwell Pharma",
  "Cubit Life Sciences",
  "RTM Healthcare",
  "Allex Pharma",
  "Navitas Life Sciences",
  "Medifame Biotech",
];

function TickerRow({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  return (
    <div
    className="
        overflow-hidden
        [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
    "
    >
      <motion.div
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex w-max gap-6 pr-6"
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            {items.map((item) => (
              <div
                key={`${item}-${i}`}
                className="whitespace-nowrap rounded-full border border-[#aa6f73]/20 bg-[#aa6f73]/10 px-5 py-3 text-[#4c1711]"
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function OurPartners() {
  return (
    <section className="py-24 bg-[#f4efee]">
      <div className="container mx-auto px-6">

        <div className="text-center mb-14">

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-[#4c1711] max-w-5xl mx-auto">
            Our Partners
          </h2>

        </div>

        {/* Hospitals */}
        <div className="mb-12">
          <h3 className="text-xl font-medium text-[#4c1711] mb-6 text-center">
            Hospitals
          </h3>

          <TickerRow items={hospitals} />
        </div>

        {/* Pharma */}
        <div>
          <h3 className="text-xl font-medium text-[#4c1711] mb-6 text-center">
            Pharmaceutical Companies
          </h3>

          <TickerRow items={pharmaCompanies} reverse />
        </div>

      </div>
    </section>
  );
}