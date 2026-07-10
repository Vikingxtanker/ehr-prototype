import { CalendarDays } from "lucide-react";

export default function CalendarCard() {
  return (
    <section className="rounded-2xl border border-[#e5dcdc] bg-white shadow-sm">

      <div className="flex items-center justify-between p-6">

        <div className="flex items-center gap-4">

          <CalendarDays
            className="h-10 w-10 text-[#87565b]"
          />

          <h2 className="text-3xl font-semibold text-[#2b0b08]">
            My Calendar
          </h2>

        </div>

        <div className="flex gap-8 text-lg text-[#2b0b08]">

          <button className="hover:text-[#87565b]">
            Block / Unblock Calendar
          </button>

          <button className="hover:text-[#87565b]">
            Mark Leave
          </button>

        </div>

      </div>

      <div className="border-t border-[#ece1e2] p-12 text-center text-[#9d8f91]">

        Calendar component will be added here.

      </div>

    </section>
  );
}