import { Button } from "@/components/ui/button";
import { CUILogo } from "./general/cui-logo";
import { GitHub, XformerlyTwitter } from "./companies";
import { ThemeToggle } from "./theme-toggle";

const dashboardLinks = [
  { href: "/student", label: "Student" },
  { href: "/professor", label: "Professor" },
  { href: "/hod", label: "HOD" },
  { href: "/director", label: "Director" },
  { href: "/admin", label: "Admin" },
] as const;

// const navLinks = [
//   { href: "#", label: "Features" },
//   { href: "#", label: "About" },
//   { href: "#", label: "Contact" },
//   { href: "#", label: "Privacy" },
// ];

const socialLinks = [
  {
    href: "#",
    label: "X",
    icon: <XformerlyTwitter className="invert dark:invert-0" />,
  },
  {
    href: "#",
    label: "Github",
    icon: <GitHub className="invert dark:invert-0" />,
  },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl *:px-4 *:md:px-6">
      <div className="flex flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <CUILogo height={30} />
          <div className="flex items-center gap-2">
            {socialLinks.map(({ href, label, icon }) => (
              <Button asChild key={label} size="sm" variant="ghost">
                <a aria-label={label} href={href}>
                  {icon}
                </a>
              </Button>
            ))}
            <ThemeToggle />
          </div>
        </div>

        <nav>
          <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
            {dashboardLinks.map((link) => (
              <li key={link.label}>
                <a
                  className="hover:text-foreground transition-colors"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
