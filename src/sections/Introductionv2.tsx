"use client";

export default function Introduction() {
  return (
    <section className="bg-[#f4efee] px-6 py-32 md:py-40">
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
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight">

          <span className="block text-[#4c1711] mb-10">
            Healthcare deserves connected long-term care.
          </span>

          <span className="block text-[#87565b] text-3xl md:text-5xl lg:text-6xl leading-[1.15] max-w-5xl mx-auto">
            Smarter chronic care, seamless patient follow-ups, and connected
            long-term healthcare support.
          </span>

          <span className="block text-[#4c1711] mt-10">
            That's why we built Anexra.
          </span>
        </h2>
      </div>
    </section>
  );
}