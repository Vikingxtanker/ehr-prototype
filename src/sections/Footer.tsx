import Image from "next/image";

import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";

const footerLinks = [
  { href: "#", label: "Contact" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms & Conditions" },
];

const socialLinks = [
  {
    href: "https://www.linkedin.com/company/anexra-solutions/",
    icon: FaLinkedinIn,
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/anexra_solutions",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/people/Anexra-Solutions/61590388512447/",
    icon: FaFacebookF,
    label: "Facebook",
  },
];

export default function Footer() {
  return (
    <footer
    data-theme="dark"
    className="
        relative
        overflow-hidden
        z-30
    "
>
    {/* Rounded Footer Background */}
    <div
    className="
        relative
        overflow-hidden

        pt-20
        pb-16
        md:pb-20
    "
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120c0b]/95 via-[#1a120f]/90 to-[#120c0b]/95" />
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        <div
          className="
            flex
            flex-col
            md:flex-row

            items-center
            md:items-center

            justify-between

            gap-10

            border-b
            border-white/10

            pb-10
          "
        >
          {/* Logo + Description */}
          <div className="max-w-md text-center md:text-left">
            <div className="relative inline-block">

            <Image
                src="/anexra-wordmark-white.svg"
                alt="Anexra Logo"
                width={180}
                height={50}
                className="
                relative
                z-10

                h-12
                w-auto

                mx-auto
                md:mx-0

                opacity-95
                "
            />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  text-white/60
                  text-sm

                  hover:text-white

                  transition-all
                  duration-300
                "
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div
          className="
            pt-8

            flex
            flex-col
            md:flex-row

            items-center
            justify-between

            gap-6
          "
        >
          <p
            className="
              text-white/40
              text-sm
              text-center
              md:text-left
            "
          >
            © 2026 Anexra. Designed and developed by Gaurav Gaikwad.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="
                    group
                    w-10
                    h-10

                    rounded-full

                    border
                    border-white/10

                    bg-white/5
                    backdrop-blur-xl

                    flex
                    items-center
                    justify-center

                    text-white/60

                    hover:text-white
                    hover:bg-white/10
                    hover:border-[#c79da1]/30
                    hover:shadow-[0_0_20px_rgba(199,157,161,0.15)]
                    hover:-translate-y-0.5

                    transition-all
                    duration-300
                    ease-out
                  "
                >
                  <Icon size={18}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}