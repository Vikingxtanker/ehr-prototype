export default function OPDSummary() {
  return (
    <section className="rounded-2xl border border-[#e5dcdc] bg-white p-6 shadow-sm">
      <div className="grid grid-cols-4 items-center">

        <div>
          <h2 className="text-3xl font-semibold text-[#2b0b08]">
            OPD Patients
          </h2>

          <p className="mt-2 text-base text-[#7f7072] underline underline-offset-2">
            Booked Appointments
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-[#2b0b08]">OPD</p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-[#2b0b08]">VC</p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-[#2b0b08]">
            Completed
          </p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

      </div>
    </section>
  );
}