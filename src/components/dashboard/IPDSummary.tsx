export default function IPDSummary() {
  return (
    <section className="rounded-2xl border border-[#e5dcdc] bg-white p-6 shadow-sm">
      <div className="grid grid-cols-6 items-center">

        <div>
          <h2 className="text-3xl font-semibold text-[#2b0b08]">
            ER/IPD Patients
          </h2>
        </div>

        <div className="text-center">
          <p className="text-lg">IP</p>

          <p className="mt-2 text-6xl font-light text-red-500">
            17
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg">
            ER Referrals
          </p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg">
            IP Referrals
          </p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg">
            Planned Discharges
          </p>

          <p className="mt-2 text-6xl font-light text-red-500">
            1
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg">
            Planned Surgeries
          </p>

          <p className="mt-2 text-6xl font-light text-red-500">
            0
          </p>
        </div>

      </div>
    </section>
  );
}