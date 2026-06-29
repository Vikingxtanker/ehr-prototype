import Link from "next/link";

export default function NotAllowedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f4efee] px-6">
      <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-lg">
        <h1 className="text-4xl font-bold text-[#4c1711]">
          Access Denied
        </h1>

        <p className="mt-4 text-[#87565b]">
          You do not have permission to access this page.
        </p>

        <Link
          href="/"
          className="
            mt-8
            inline-block
            rounded-xl
            bg-[#4c1711]
            px-6
            py-3
            text-white
            transition
            hover:bg-[#3a120d]
          "
        >
          Go to Homepage
        </Link>
      </div>
    </section>
  );
}