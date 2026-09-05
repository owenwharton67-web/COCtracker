"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { focusRing } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const ICONS = {
  overview: (
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  plan: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  resources: (
    <path d="M12 8c-3.314 0-6-1.343-6-3s2.686-3 6-3 6 1.343 6 3-2.686 3-6 3zm0 0c3.314 0 6 1.343 6 3v6c0 1.657-2.686 3-6 3s-6-1.343-6-3V11c0-1.657 2.686-3 6-3zm6 3c0 1.657-2.686 3-6 3s-6-1.343-6-3" />
  ),
  buildings: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 12h.01M15 12h.01M9 8h.01M15 8h.01" />,
  import: <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />,
  log: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />,
  sync: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
};

function Icon({ path }: { path: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 shrink-0">
      {path}
    </svg>
  );
}

const GROUPS: NavGroup[] = [
  { items: [{ href: "/", label: "Overview", icon: <Icon path={ICONS.overview} /> }] },
  { items: [{ href: "/plan", label: "Upgrade plan", icon: <Icon path={ICONS.plan} /> }] },
  {
    title: "Your data",
    items: [
      { href: "/data/import", label: "Import / export", icon: <Icon path={ICONS.import} /> },
      { href: "/data/resources", label: "Resources & items", icon: <Icon path={ICONS.resources} /> },
      { href: "/data/buildings", label: "Buildings", icon: <Icon path={ICONS.buildings} /> },
    ],
  },
  {
    items: [
      { href: "/log", label: "Upgrade log", icon: <Icon path={ICONS.log} /> },
      { href: "/sync", label: "Sync status", icon: <Icon path={ICONS.sync} /> },
    ],
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${focusRing} ` +
        (active ? "bg-accent-soft text-accent-strong font-medium" : "text-muted hover:text-text hover:bg-surface-hover")
      }
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex items-center gap-2 px-3 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-on-accent font-bold text-sm">CC</span>
        <span className="font-semibold text-text tracking-tight">Base Tracker</span>
      </div>
      <nav className="flex-1 flex flex-col gap-4 px-2">
        {GROUPS.map((group, i) => (
          <div key={i}>
            {group.title && <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">{group.title}</div>}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop: fixed left column */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface md:h-screen md:sticky md:top-0">
        {content}
      </aside>

      {/* Mobile: horizontal scroll bar up top */}
      <header className="md:hidden border-b border-border bg-surface">
        <div className="flex items-center gap-2 px-3 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-on-accent font-bold text-xs">CC</span>
          <span className="font-semibold text-text text-sm">Base Tracker</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 -mt-1">
          {GROUPS.flatMap((g) => g.items).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors ${focusRing} ` +
                (pathname === item.href ? "bg-accent-soft text-accent-strong font-medium" : "text-muted hover:text-text")
              }
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
