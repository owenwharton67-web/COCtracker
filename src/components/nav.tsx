import Link from "next/link";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/plan", label: "Upgrade plan" },
  { href: "/data/resources", label: "Resources & items" },
  { href: "/data/buildings", label: "Buildings" },
  { href: "/log", label: "Upgrade log" },
  { href: "/sync", label: "Sync status" },
];

export function Nav() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-semibold tracking-tight">CoC Base Tracker</span>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
